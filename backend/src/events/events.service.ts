import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RRule, rrulestr } from 'rrule';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async getAllEvents(userId: number) {
    return this.prisma.event.findMany({
      where: { userId },
      orderBy: { startTime: 'asc' },
    });
  }

  async getEventById(userId: number, id: number) {
    const event = await this.prisma.event.findFirst({ where: { id, userId } });
    if (!event) throw new NotFoundException('Event not found.');
    return event;
  }

  async getEventsByRange(userId: number, startDate: string, endDate: string) {
    if (!startDate || !endDate) throw new BadRequestException('startDate and endDate are required.');
    return this.prisma.event.findMany({
      where: {
        userId,
        startTime: { gte: new Date(startDate) },
        endTime: { lte: new Date(endDate) },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  private expandEvents(allEvents: any[], start: Date, end: Date) {
    const expandedEvents: any[] = [];
    const exceptionsMap = new Map<string, any>(); // key: parentId_originalStartTime
  
    allEvents.forEach((ev) => {
      if (ev.parentEventId && ev.originalStartTime) {
        const key = `${ev.parentEventId}_${new Date(ev.originalStartTime).getTime()}`;
        exceptionsMap.set(key, ev);
      }
    });
  
    allEvents.forEach((ev) => {
      if (ev.parentEventId) return; 
  
      if (ev.recurrence === 'none') {
        if (ev.endTime > start && ev.startTime < end) {
          expandedEvents.push(ev);
        }
      } else {
        try {
          let recStr = ev.recurrence;
          if (recStr === 'daily') recStr = 'FREQ=DAILY';
          else if (recStr === 'weekly') recStr = 'FREQ=WEEKLY';
          else if (recStr === 'monthly') recStr = 'FREQ=MONTHLY';
  
          const lines = recStr.split('\n');
          const rrulePart = lines[0]; 
          const extraLines = lines.slice(1).join('\n'); 
          
          const dtstart = `DTSTART:${new Date(ev.startTime).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'}`;
          let icalStr = `${dtstart}\nRRULE:${rrulePart}`;
          if (extraLines) icalStr += `\n${extraLines}`;
  
          const rule = rrulestr(icalStr);
          const occurrences = rule.between(start, end, true);
          
          occurrences.forEach((occurrence) => {
            const key = `${ev.id}_${occurrence.getTime()}`;
            if (exceptionsMap.has(key)) {
              const exception = exceptionsMap.get(key);
              if (exception.endTime > start && exception.startTime < end) {
                expandedEvents.push(exception);
              }
            } else {
              const duration = new Date(ev.endTime).getTime() - new Date(ev.startTime).getTime();
              const occEnd = new Date(occurrence.getTime() + duration);
              
              if (occEnd > start && occurrence < end) {
                expandedEvents.push({
                  ...ev,
                  id: `${ev.id}_${occurrence.getTime()}`,
                  originalId: ev.id,
                  startTime: occurrence,
                  endTime: occEnd,
                });
              }
            }
          });
        } catch (err) {
          console.error("Error expanding event", ev.id, err);
        }
      }
    });
  
    return expandedEvents;
  }

  async getExpandedEvents(userId: number, startDate: string, endDate: string) {
    if (!startDate || !endDate) throw new BadRequestException('startDate and endDate are required.');
    const start = new Date(startDate);
    const end = new Date(endDate);
    const allEvents = await this.prisma.event.findMany({ where: { userId } });
    const expandedEvents = this.expandEvents(allEvents, start, end);
    return expandedEvents.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }

  async getOverlappingEvents(userId: number, startTime: string, endTime: string, excludeId?: string) {
    if (!startTime || !endTime) throw new BadRequestException('startTime and endTime are required.');
    const start = new Date(startTime);
    const end = new Date(endTime);
    const allEvents = await this.prisma.event.findMany({ where: { userId } });
    let expanded = this.expandEvents(allEvents, start, end);

    if (excludeId) {
      const parsedExclude = parseInt(excludeId);
      expanded = expanded.filter(e => e.id !== parsedExclude && e.originalId !== parsedExclude);
    }
    return expanded;
  }

  async createEvent(userId: number, data: any) {
    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);
    if (endTime <= startTime) throw new BadRequestException('End time must be after start time.');
    return this.prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        startTime,
        endTime,
        location: data.location,
        color: data.color ?? '#1a73e8',
        allDay: data.allDay ?? false,
        recurrence: data.recurrence ?? 'none',
        parentEventId: data.parentEventId,
        originalStartTime: data.originalStartTime ? new Date(data.originalStartTime) : null,
        userId,
      },
    });
  }

  async updateEvent(userId: number, id: number, data: any) {
    const existing = await this.prisma.event.findFirst({ where: { id, userId } });
    if (!existing) throw new NotFoundException('Event not found.');
    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);
    if (endTime <= startTime) throw new BadRequestException('End time must be after start time.');
    
    if (data.updateScope === 'this') {
      return this.prisma.event.create({
        data: {
          title: data.title,
          description: data.description,
          startTime,
          endTime,
          location: data.location,
          color: data.color ?? existing.color,
          allDay: data.allDay ?? existing.allDay,
          recurrence: 'none',
          parentEventId: existing.parentEventId || id,
          originalStartTime: data.originalStartTime ? new Date(data.originalStartTime) : null,
          userId,
        }
      });
    }

    if (data.updateScope === 'following') {
      if (existing.recurrence !== 'none' && data.originalStartTime) {
        const untilDate = new Date(data.originalStartTime);
        const untilStr = untilDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        let newRecurrence = existing.recurrence;
        if (!newRecurrence.includes('UNTIL=')) {
          newRecurrence += `;UNTIL=${untilStr}`;
        }
        await this.prisma.event.update({ where: { id }, data: { recurrence: newRecurrence } });
      }
      return this.prisma.event.create({
        data: {
          title: data.title,
          description: data.description,
          startTime,
          endTime,
          location: data.location,
          color: data.color ?? existing.color,
          allDay: data.allDay ?? existing.allDay,
          recurrence: data.recurrence ?? existing.recurrence,
          userId,
        }
      });
    }

    return this.prisma.event.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        startTime,
        endTime,
        location: data.location,
        color: data.color ?? existing.color,
        allDay: data.allDay ?? existing.allDay,
        recurrence: data.recurrence ?? existing.recurrence,
      },
    });
  }

  async deleteEvent(userId: number, id: number, scope?: string, originalStartTime?: string) {
    const existing = await this.prisma.event.findFirst({ where: { id, userId } });
    if (!existing) throw new NotFoundException('Event not found.');

    if (scope === 'following' && originalStartTime) {
      const untilDate = new Date(new Date(originalStartTime).getTime() - 1);
      const untilStr = untilDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      let newRecurrence = existing.recurrence;
      if (newRecurrence === 'daily') newRecurrence = 'FREQ=DAILY';
      else if (newRecurrence === 'weekly') newRecurrence = 'FREQ=WEEKLY';
      else if (newRecurrence === 'monthly') newRecurrence = 'FREQ=MONTHLY';
      newRecurrence = newRecurrence.replace(/;UNTIL=[^;\n]*/g, '');
      newRecurrence += `;UNTIL=${untilStr}`;
      await this.prisma.event.update({ where: { id }, data: { recurrence: newRecurrence } });
      return;
    }

    if (scope === 'this' && originalStartTime) {
      const exDate = new Date(originalStartTime);
      const exDateStr = exDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      let newRecurrence = existing.recurrence;
      if (newRecurrence === 'daily') newRecurrence = 'FREQ=DAILY';
      else if (newRecurrence === 'weekly') newRecurrence = 'FREQ=WEEKLY';
      else if (newRecurrence === 'monthly') newRecurrence = 'FREQ=MONTHLY';
      newRecurrence = newRecurrence.includes('\nEXDATE:') 
        ? `${newRecurrence},${exDateStr}` 
        : `${newRecurrence}\nEXDATE:${exDateStr}`;
      await this.prisma.event.update({ where: { id }, data: { recurrence: newRecurrence } });
      return;
    }

    await this.prisma.event.delete({ where: { id } });
  }
}
