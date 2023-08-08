type ID = number;

export interface Task {
  task: string;
  id: ID;
  elapsedTime: number;
  parentID?: ID;
  subTasks?: ID[];
}
