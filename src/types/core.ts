export interface Task {
  task: string;
  id: number;
  elapsedTime: number;
  subTasks?: Task[];
}
