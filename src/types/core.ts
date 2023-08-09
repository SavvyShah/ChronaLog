type ID = number;

export interface Task {
  name: string;
  id: ID;
  elapsedTime: number;
  parentID?: ID;
  subTasks?: ID[];
  logs?: ID[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Log {
  name: string;
  id: ID;
  elapsedTime: number;
  parentID: ID;
  createdAt?: Date;
  updatedAt?: Date;
  tags?: string[];
}
