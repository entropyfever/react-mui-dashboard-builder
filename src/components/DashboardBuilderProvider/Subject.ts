
export class Subject<T> {

	private observers: ((args: T) => void)[];

	constructor() {
		this.observers = [];
	}

	public isEmpty(){
		return this.observers.length === 0;
	}

	public attach(observer: (args: T) => void): void{
		this.observers.push(observer);
	}

	public detach(observer: (args: T) => void): void{
		this.observers = this.observers.filter((obs) => obs !== observer);
	}

	public notify(args: T): void{
		this.observers.forEach((observer) => {
			observer(args);
		})
	}
}
