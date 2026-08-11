"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const rrule_1 = require("rrule");
let EventsService = class EventsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAllEvents(userId) {
        return this.prisma.event.findMany({
            where: { userId },
            orderBy: { startTime: 'asc' },
        });
    }
    async getEventById(userId, id) {
        const event = await this.prisma.event.findFirst({ where: { id, userId } });
        if (!event)
            throw new common_1.NotFoundException('Event not found.');
        return event;
    }
    async getEventsByRange(userId, startDate, endDate) {
        if (!startDate || !endDate)
            throw new common_1.BadRequestException('startDate and endDate are required.');
        return this.prisma.event.findMany({
            where: {
                userId,
                startTime: { gte: new Date(startDate) },
                endTime: { lte: new Date(endDate) },
            },
            orderBy: { startTime: 'asc' },
        });
    }
    expandEvents(allEvents, start, end) {
        const expandedEvents = [];
        const exceptionsMap = new Map();
        allEvents.forEach((ev) => {
            if (ev.parentEventId && ev.originalStartTime) {
                const key = `${ev.parentEventId}_${new Date(ev.originalStartTime).getTime()}`;
                exceptionsMap.set(key, ev);
            }
        });
        allEvents.forEach((ev) => {
            if (ev.parentEventId)
                return;
            if (ev.recurrence === 'none') {
                if (ev.endTime > start && ev.startTime < end) {
                    expandedEvents.push(ev);
                }
            }
            else {
                try {
                    let recStr = ev.recurrence;
                    if (recStr === 'daily')
                        recStr = 'FREQ=DAILY';
                    else if (recStr === 'weekly')
                        recStr = 'FREQ=WEEKLY';
                    else if (recStr === 'monthly')
                        recStr = 'FREQ=MONTHLY';
                    const lines = recStr.split('\n');
                    const rrulePart = lines[0];
                    const extraLines = lines.slice(1).join('\n');
                    const dtstart = `DTSTART:${new Date(ev.startTime).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'}`;
                    let icalStr = `${dtstart}\nRRULE:${rrulePart}`;
                    if (extraLines)
                        icalStr += `\n${extraLines}`;
                    const rule = (0, rrule_1.rrulestr)(icalStr);
                    const occurrences = rule.between(start, end, true);
                    occurrences.forEach((occurrence) => {
                        const key = `${ev.id}_${occurrence.getTime()}`;
                        if (exceptionsMap.has(key)) {
                            const exception = exceptionsMap.get(key);
                            if (exception.endTime > start && exception.startTime < end) {
                                expandedEvents.push(exception);
                            }
                        }
                        else {
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
                }
                catch (err) {
                    console.error("Error expanding event", ev.id, err);
                }
            }
        });
        return expandedEvents;
    }
    async getExpandedEvents(userId, startDate, endDate) {
        if (!startDate || !endDate)
            throw new common_1.BadRequestException('startDate and endDate are required.');
        const start = new Date(startDate);
        const end = new Date(endDate);
        const allEvents = await this.prisma.event.findMany({ where: { userId } });
        const expandedEvents = this.expandEvents(allEvents, start, end);
        return expandedEvents.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    }
    async getOverlappingEvents(userId, startTime, endTime, excludeId) {
        if (!startTime || !endTime)
            throw new common_1.BadRequestException('startTime and endTime are required.');
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
    async createEvent(userId, data) {
        const startTime = new Date(data.startTime);
        const endTime = new Date(data.endTime);
        if (endTime <= startTime)
            throw new common_1.BadRequestException('End time must be after start time.');
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
    async updateEvent(userId, id, data) {
        const existing = await this.prisma.event.findFirst({ where: { id, userId } });
        if (!existing)
            throw new common_1.NotFoundException('Event not found.');
        const startTime = new Date(data.startTime);
        const endTime = new Date(data.endTime);
        if (endTime <= startTime)
            throw new common_1.BadRequestException('End time must be after start time.');
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
    async deleteEvent(userId, id, scope, originalStartTime) {
        const existing = await this.prisma.event.findFirst({ where: { id, userId } });
        if (!existing)
            throw new common_1.NotFoundException('Event not found.');
        if (scope === 'following' && originalStartTime) {
            const untilDate = new Date(new Date(originalStartTime).getTime() - 1);
            const untilStr = untilDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
            let newRecurrence = existing.recurrence;
            if (newRecurrence === 'daily')
                newRecurrence = 'FREQ=DAILY';
            else if (newRecurrence === 'weekly')
                newRecurrence = 'FREQ=WEEKLY';
            else if (newRecurrence === 'monthly')
                newRecurrence = 'FREQ=MONTHLY';
            newRecurrence = newRecurrence.replace(/;UNTIL=[^;\n]*/g, '');
            newRecurrence += `;UNTIL=${untilStr}`;
            await this.prisma.event.update({ where: { id }, data: { recurrence: newRecurrence } });
            return;
        }
        if (scope === 'this' && originalStartTime) {
            const exDate = new Date(originalStartTime);
            const exDateStr = exDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
            let newRecurrence = existing.recurrence;
            if (newRecurrence === 'daily')
                newRecurrence = 'FREQ=DAILY';
            else if (newRecurrence === 'weekly')
                newRecurrence = 'FREQ=WEEKLY';
            else if (newRecurrence === 'monthly')
                newRecurrence = 'FREQ=MONTHLY';
            newRecurrence = newRecurrence.includes('\nEXDATE:')
                ? `${newRecurrence},${exDateStr}`
                : `${newRecurrence}\nEXDATE:${exDateStr}`;
            await this.prisma.event.update({ where: { id }, data: { recurrence: newRecurrence } });
            return;
        }
        await this.prisma.event.delete({ where: { id } });
    }
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EventsService);
//# sourceMappingURL=events.service.js.map