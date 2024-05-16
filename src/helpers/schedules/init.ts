import Schedule, { Queue, Job } from 'bull';
import ReminderJob from './users';
import  { ScheduleNames } from '../constants';

export default class QueueService {
  private static instance: QueueService;
  public queue: Queue;

  private constructor() {
    // Initialize Bull queue
    this.queue = new Schedule('testQueue');
  }

  public static getInstance(): QueueService {
    if (!QueueService.instance) {
      QueueService.instance = new QueueService();
    }
    return QueueService.instance;
  }

  public static getQueue(): Queue {
    return this.instance.queue;
  }
}