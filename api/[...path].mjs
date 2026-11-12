import * as store from './_store.mjs';

const routes = {
  GET: {
    dashboard: () => store.dashboard(),
    students: () => store.getStudents(),
    rooms: () => store.getRooms(),
    fees: () => store.getFees(),
    complaints: () => store.getComplaints()
  }
};

function send(response, status, data) {
  if (status === 204) return response.status(204).end();
  return response.status(status).json(data);
}

export default async function handler(request, response) {
  try {
    const path = Array.isArray(request.query.path)
      ? request.query.path.join('/')
      : request.query.path ?? '';
    const [resource, rawId] = path.split('/');
    const id = Number(rawId);
    const body = request.body ?? {};

    if (routes[request.method]?.[resource] && !rawId) return send(response, 200, routes[request.method][resource]());
    if (request.method === 'POST' && resource === 'students') return send(response, 201, store.addStudent(body));
    if (request.method === 'PUT' && resource === 'students' && Number.isInteger(id)) return send(response, 200, store.updateStudent(id, body));
    if (request.method === 'DELETE' && resource === 'students' && Number.isInteger(id)) { store.deleteStudent(id); return send(response, 204); }
    if (request.method === 'POST' && resource === 'rooms') return send(response, 201, store.addRoom(body));
    if (request.method === 'DELETE' && resource === 'rooms' && Number.isInteger(id)) { store.deleteRoom(id); return send(response, 204); }
    if (request.method === 'POST' && resource === 'fees') return send(response, 201, store.addFee(body));
    if (request.method === 'POST' && resource === 'complaints') return send(response, 201, store.addComplaint(body));
    if (request.method === 'PATCH' && resource === 'complaints' && Number.isInteger(id)) return send(response, 200, store.updateComplaint(id, body.status));
    return send(response, 404, { message: 'Endpoint not found.' });
  } catch (error) {
    return send(response, error.status ?? 500, { message: error.message ?? 'Something went wrong.' });
  }
}
