export default class WorkQueue {
  private ids: number[];
  private currentIndex: number = 0;

  constructor(ids: number[]) {
    this.ids = ids;
  }

  getNext() {
    if (this.currentIndex < this.ids.length) {
      return this.ids[this.currentIndex++];
    }
    return null;
  }
}
