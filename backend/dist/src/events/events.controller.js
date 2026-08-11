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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsController = void 0;
const common_1 = require("@nestjs/common");
const events_service_1 = require("./events.service");
const auth_guard_1 = require("../auth/auth.guard");
let EventsController = class EventsController {
    eventsService;
    constructor(eventsService) {
        this.eventsService = eventsService;
    }
    getAllEvents(req) {
        return this.eventsService.getAllEvents(req.user.id);
    }
    getEventsByRange(req, startDate, endDate) {
        return this.eventsService.getEventsByRange(req.user.id, startDate, endDate);
    }
    getExpandedEvents(req, startDate, endDate) {
        return this.eventsService.getExpandedEvents(req.user.id, startDate, endDate);
    }
    getOverlappingEvents(req, startTime, endTime, excludeId) {
        return this.eventsService.getOverlappingEvents(req.user.id, startTime, endTime, excludeId);
    }
    getEventById(req, id) {
        return this.eventsService.getEventById(req.user.id, +id);
    }
    createEvent(req, body) {
        return this.eventsService.createEvent(req.user.id, body);
    }
    updateEvent(req, id, body) {
        return this.eventsService.updateEvent(req.user.id, +id, body);
    }
    deleteEvent(req, id, scope, originalStartTime) {
        return this.eventsService.deleteEvent(req.user.id, +id, scope, originalStartTime);
    }
};
exports.EventsController = EventsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "getAllEvents", null);
__decorate([
    (0, common_1.Get)('range'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "getEventsByRange", null);
__decorate([
    (0, common_1.Get)('expanded'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "getExpandedEvents", null);
__decorate([
    (0, common_1.Get)('overlap'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('startTime')),
    __param(2, (0, common_1.Query)('endTime')),
    __param(3, (0, common_1.Query)('excludeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "getOverlappingEvents", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "getEventById", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "createEvent", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "updateEvent", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Query)('scope')),
    __param(3, (0, common_1.Query)('originalStartTime')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "deleteEvent", null);
exports.EventsController = EventsController = __decorate([
    (0, common_1.Controller)('api/events'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __metadata("design:paramtypes", [events_service_1.EventsService])
], EventsController);
//# sourceMappingURL=events.controller.js.map