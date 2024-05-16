import {
  PrismaClient,
  type users as UserType,
} from "@prisma/client";

const prisma = new PrismaClient();

export interface UserQueryType {
  getUsers: () => Promise<UserType[] | null>;
  getUserById: (userId: number) => Promise<UserType | null>;
  createUser: (user: UserType) => Promise<UserType | null>;
  updateUser: (user: UserType) => Promise<UserType | null>;
  deleteUser: (userId: number) => Promise<UserType | null>;
};

const getUsers = async (): Promise<UserType[] | null> => {
  return await prisma.users.findMany({});
};

const getUserById = async (idUser: number): Promise<UserType | null> => {
  return await prisma.users.findUnique({
    where: {
      id: idUser
    }
  })
}

const createUser = async (user: UserType): Promise<UserType | null> => {
  return await prisma.users.create({
    data: user
  });
}

const updateUser = async (user: UserType): Promise<UserType | null> => {
  return await prisma.users.update({
    data: user,
    where: {
      id: user.id
    }
  })
}

const deleteUser = async (userId: number): Promise<UserType> => {
  return await prisma.users.delete({
    where: {
      id: userId
    }
  });
}

const UserQueries: UserQueryType = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
export default UserQueries;
