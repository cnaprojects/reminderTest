import {
  PrismaClient,
  type sent_emails as SentEmailType,
  type sent_emails_message_type as MessageType
} from "@prisma/client";

const prisma = new PrismaClient();

export interface SentEmailQueries {
  getSentEmails: () => Promise<SentEmailType[] | null>;
  getSentEmailsByUser: (userId: number, messageType?: MessageType) => Promise<SentEmailType | null>;
  addSentEmail: (idUser: number, messageType: MessageType, attempts: number, sentDate: Date) => Promise<SentEmailType | null>;
};

const getSentEmails = async (): Promise<SentEmailType[] | null> => {
  return await prisma.sent_emails.findMany({});
};

const getSentEmailsByUser = async (idUser: number, messageType?: MessageType): Promise<SentEmailType | null> => {
  return await prisma.sent_emails.findFirst({
    where: {
      id_user: idUser,
      ...messageType && {message_type: messageType}
    },
    orderBy: {
      id: 'desc'
    }
  })
}

const addSentEmail = async (idUser: number, messageType: MessageType, attempts: number, sentDate: Date): Promise<SentEmailType | null> => {
  return await prisma.sent_emails.create({
    data: {
      id_user: idUser,
      message_type: messageType,
      attempts,
      sent_date: sentDate
    }
  });
}

const sentEmailQueries: SentEmailQueries = {
  getSentEmails,
  getSentEmailsByUser,
  addSentEmail
};
export default sentEmailQueries;
