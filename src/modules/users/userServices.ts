import UserQueries from './queries';
import type { UserReminderType } from '../../helpers/schedules/users'
import axios, { AxiosResponse } from 'axios';
import sentEmailQueries from '../sentEmails/queries'
import { sent_emails_message_type as ReminderType, users as UserType } from'@prisma/client';
import ReminderJobs from '../../helpers/schedules/users'
import InitJob from '../../helpers/schedules/init'

class UserServices {
  async checkEmailAlreadySent (userId: number, reminderType: ReminderType): Promise<boolean> {
    const sentEmail = await sentEmailQueries.getSentEmailsByUser(userId, reminderType);
    if (sentEmail && this.isReminderToday(new Date(sentEmail.sent_date))) {
      return true;
    }

    return false;
  }

  async checkUserReminder (userId: number, reminderType: ReminderType): Promise<UserType |  null> {
    const user = await UserQueries.getUserById(userId);
    if (user) {
      if (reminderType === ReminderType.birthday && user.birthday && this.isReminderToday(new Date(user.birthday))) {
        return user
      }
      
      if (reminderType === ReminderType.anniversary && user.anniversary_date && this.isReminderToday(new Date(user.anniversary_date))) {
        return user;
      }
    }

    // add more reminder

    return null;
  };

  isReminderToday (reminderDate: Date): boolean {
    const today = new Date();
    return (
      reminderDate.getDate() === today.getDate() &&
      reminderDate.getMonth() === today.getMonth()
    );
  };

  async sendEmailReminder (reminder: UserReminderType, user: UserType): Promise<void> {
    const apiUrl = 'https://email-service.digitalenvision.com.au/send-email';

    const response: AxiosResponse = await axios.post(apiUrl, {
      email: reminder.email,
      message: reminder.message
    }, {
      headers: {
          'Content-Type': 'application/json'
      }
    });

    if (response.status === 200) {
      // Return response data from the API if status is 200
      await sentEmailQueries.addSentEmail(
        reminder.userId,
        reminder.reminderType,
        reminder.attempts,
        new Date()
      );
    } else {
        // Reschedule the reminder
        if (reminder.reminderType === ReminderType.birthday) {
          await ReminderJobs.addUsersBirthdayJobs(InitJob.getQueue(), user, reminder.attempts ++);
        } else if (reminder.reminderType === ReminderType.anniversary) {
          await ReminderJobs.addUsersAnniversaryJobs(InitJob.getQueue(), user, reminder.attempts ++);
        }
    }
  }
}

export default new UserServices()