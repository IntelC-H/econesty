class DummyAPICollection {
  constructor() {
    this.elements = {};
    this.currentID = 1;
  }

  getElements() {
    return Object.values(this.elements);
  }

  create(body) {
    let withID = { ...body, id: this.currentID };
    this.elements[this.currentID++] = withID;
    return new Promise((resolve, reject) => resolve(withID)); // eslint-disable-line no-unused-vars
  }

  read(id) {
    return new Promise((resolve, reject) => resolve(this.elements[id])); // eslint-disable-line no-unused-vars
  }

  list(page) {
    let zeroPage = page - 1;
    let allElements = this.getElements();
    return new Promise((resolve, reject) => resolve({ // eslint-disable-line no-unused-vars
      previous: page <= 1 ? null : page - 1,
      next: page >= Math.floor(allElements.length / 10) ? null : page + 1,
      count: allElements.length,
      results: allElements.slice(zeroPage, zeroPage + 10)
    }));
  }

  update(id, body = null) {
    if (body) this.elements[id] = { ...this.elements[id], ...body };
    return new Promise((resolve, reject) => resolve(this.elements[id])); // eslint-disable-line no-unused-vars
  }

  delete(id) {
    let v = this.elements[id];
    delete this.elements[id];
    return new Promise((resolve, reject) => resolve(v)); // eslint-disable-line no-unused-vars
  }

  save({id, ...body}) {
    if (id !== null && id !== undefined) return this.create(body);
    return this.update(id, body);
  }
}

export { DummyAPICollection };
export default DummyAPICollection;
