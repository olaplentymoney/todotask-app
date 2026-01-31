const handler = require('../app');
const mockResponse = () => {
  const res = {};
  res.writeHead = jest.fn();
  res.end = jest.fn();
  res.setHeader = jest.fn();
  return res;
};

describe('GET /todo', () => {
  it('should return todos or error if unauthorized', () => {
    const req = {
      method: 'GET',
      url: '/todo',
      headers: {}, // no Authorization header
    };
    const res = mockResponse();

    handler(req, res);

    expect(res.writeHead).toHaveBeenCalled();
    expect(res.end).toHaveBeenCalled();
  });
});
