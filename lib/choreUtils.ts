import { ChoreType } from '@/app/(context)/ChoresContext';

export interface ChoreUser {
  displayName: string;
  finished: boolean;
}

export function findChoreUser(chore: ChoreType, displayName: string): ChoreUser | undefined {
  return chore.usersList.find((choreUser) => choreUser.displayName === displayName);
}

export function isChoreFinishedByUser(chore: ChoreType, displayName: string): boolean {
  const choreUser = findChoreUser(chore, displayName);
  return choreUser?.finished === true;
}

export function isChoreUnfinishedByUser(chore: ChoreType, displayName: string): boolean {
  const choreUser = findChoreUser(chore, displayName);
  return choreUser?.finished === false;
}

export function getChoreUserStatus(chore: ChoreType, displayName: string): boolean | undefined {
  const choreUser = findChoreUser(chore, displayName);
  return choreUser?.finished;
}

export function isUserAssignedToChore(chore: ChoreType, displayName: string): boolean {
  return findChoreUser(chore, displayName) !== undefined;
}