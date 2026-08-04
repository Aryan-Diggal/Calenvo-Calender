import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { EventsService } from './events.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('api/events')
@UseGuards(AuthGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  getAllEvents(@Req() req: any) {
    return this.eventsService.getAllEvents(req.user.id);
  }

  @Get('range')
  getEventsByRange(@Req() req: any, @Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    return this.eventsService.getEventsByRange(req.user.id, startDate, endDate);
  }

  @Get('expanded')
  getExpandedEvents(@Req() req: any, @Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    return this.eventsService.getExpandedEvents(req.user.id, startDate, endDate);
  }

  @Get('overlap')
  getOverlappingEvents(
    @Req() req: any,
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
    @Query('excludeId') excludeId?: string,
  ) {
    return this.eventsService.getOverlappingEvents(req.user.id, startTime, endTime, excludeId);
  }

  @Get(':id')
  getEventById(@Req() req: any, @Param('id') id: string) {
    return this.eventsService.getEventById(req.user.id, +id);
  }

  @Post()
  createEvent(@Req() req: any, @Body() body: any) {
    return this.eventsService.createEvent(req.user.id, body);
  }

  @Patch(':id')
  updateEvent(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.eventsService.updateEvent(req.user.id, +id, body);
  }

  @Delete(':id')
  deleteEvent(
    @Req() req: any,
    @Param('id') id: string,
    @Query('scope') scope?: string,
    @Query('originalStartTime') originalStartTime?: string,
  ) {
    return this.eventsService.deleteEvent(req.user.id, +id, scope, originalStartTime);
  }
}
