import {Observable} from 'rxjs/Observable';

export interface Response<T> {
  status: number;
  json?: any;
  text?: string;
  headers: Headers;
}

function fetchObs<T>(url: string, method: string, data: any, headers: Headers): Observable<Response<T>> {
  return Observable.create(obs => {
    // TODO: once more prevalent in browsers, implement abort on unsubscribe
    const respPromise = fetch(url, {
      method,
    });

    // The fetch API makes things difficult by making you go through another
    // layer of promise to access the body of the response.
    respPromise.then(
      resp => {
        if (!resp.ok) {
          return resp.text().then(t => Promise.reject({
            status: resp.status,
            text: t,
          }));
        }
        return resp.json().then(j => Promise.resolve({
          status: resp.status,
          json: j,
          headers: resp.headers,
        }));
      },
      err => { obs.error(err); })
    .then(
      data => { 
       obs.next(data);
       obs.complete();
      },
      err => { obs.error(err); });
    
    //return () => { controller.abort(); }
  });
}

export function get<T>(url: string, headers?: Headers): Observable<Response<T>> {
  return fetchObs<T>(url, "GET", undefined, headers);
}

export function post<T>(url: string, data: any, headers: Headers): Observable<Response<T>> {
  return fetchObs<T>(url, "POST", data, headers);
}

export function put<T>(url: string, data: any, headers: Headers): Observable<Response<T>> {
  return fetchObs<T>(url, "PUT", data, headers);
}

export function patch<T>(url: string, data: any, headers: Headers): Observable<Response<T>> {
  return fetchObs<T>(url, "PATCH", data, headers);
}

// Suffixed with underscore to avoid keyword clash.
export function delete_<T>(url: string, headers: Headers): Observable<Response<T>> {
  return fetchObs<T>(url, "DELETE", undefined, headers);
}
