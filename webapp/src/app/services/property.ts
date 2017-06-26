import {MongoVersioningClient} from './mongo.ts';

@Injectable()
export class PropertyService {
  kindToPath = {
    property: "/properties",
    lease: "/leases",
    contact: "/contacts",
    media: "/media.files",
    note: "/notes",
    user: "/users",
  }
  client: MongoVersioningClient

  constructor(private http: Http, private store: Store<AppState>) {
    this.client = new MongoVersioningClient(http, this.kindToPath);
  }


  private base_path(kind: string): string {
    if (!(kind in this.kindToPath)) {
      throw `Model kind $kind not in client map: $this.kindToPath`;
    }
    return this.kindToPath[kind];
  }

  getProperties({page = 1, count = 10, sort_by = 'name', order = 'asc'} = {}): Observable<Property[]> {
    return this.client.get_list(Property.kind, {page, count, sort_by, order});
  }

  getProperty(id: string): Observable<Property> {
    return this.client.get_one(id, Property.kind);
  }

  create<T extends Model>(obj: T): Observable<T> {
    return this.client.create(obj);
  }


}
