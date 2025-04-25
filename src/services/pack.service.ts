import Api from "./Api";
import {Service} from "./Service";

export class PackService extends Service {
  constructor() {
    super(Api, 'pack');
  }
}

export default PackService;