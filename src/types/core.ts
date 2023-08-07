export interface Task {
  task: string;
  elapsedTime: number;
  subTasks?: Task[];
}
