import seed from '../my-static-api/db.json';

const KEY = 'yashi-blog-demo-v1';
function read() {
  const saved = localStorage.getItem(KEY);
  if (saved === null) return structuredClone(seed.blog);
  const rows = JSON.parse(saved);
  if (!Array.isArray(rows)) throw new Error('Saved blog data is invalid. Clear this site’s storage to reset the demo.');
  return rows;
}
function request(method, url, body) {
  try {
    const rows = read();
    const tail = url.split('/').pop();
    const isList = tail === 'blog' || tail === 'db.json';
    const index = isList ? -1 : rows.findIndex(row => String(row.id) === tail);
    if (!isList && index < 0) throw new Error('Blog post not found.');
    let data;
    if (method === 'get') data = isList ? rows : rows[index];
    else {
      if (method === 'post') {
        data = { ...body, id: crypto.randomUUID() };
        rows.push(data);
      } else if (method === 'delete') {
        data = rows.splice(index, 1)[0];
      } else {
        data = method === 'patch' ? { ...rows[index], ...body } : { ...body, id: rows[index].id };
        rows[index] = data;
      }
      localStorage.setItem(KEY, JSON.stringify(rows));
    }
    return Promise.resolve({ data, status: 200 });
  } catch (error) {
    return Promise.reject(error);
  }
}
const api = Object.fromEntries(['get', 'post', 'put', 'patch', 'delete'].map(method => [method, (url, body) => request(method, url, body)]));
export default api;
