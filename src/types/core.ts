type ID = number;

export interface Task {
  task: string;
  id: ID;
  elapsedTime: number;
  parentId?: ID;
  subTasks?: ID[];
}
