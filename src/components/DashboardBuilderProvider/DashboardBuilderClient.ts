import {TreeClient} from "./TreeClient";
import {TreeItem} from "../SortableTree/types";

export class DashboardBuilderClient<T extends TreeItem> extends TreeClient<T> {

	constructor() {
		super();
	}
}
