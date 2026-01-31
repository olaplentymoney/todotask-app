const handler = require('../app');
const mockResponse = () => {
  const res = {};
  res.writeHead = jest.fn();
  res.end = jest.fn();
  res.setHeader = jest.fn();
  return res;
};

describe('DELETE /todo', () => {
  it('should handle delete todo', () => {
    const body = JSON.stringify({ id: '123' });

    const req = {
      method: 'DELETE',
      url: '/todo',
      headers: {
        'content-type': 'application/json',
        authorization: 'Basic dGVzdDp0ZXN0',
      },
      on: (event, cb) => {
        if (event === 'data') cb(body);
        if (event === 'end') cb();
      },
    };

    const res = mockResponse();

    handler(req, res);

    expect(res.writeHead).toHaveBeenCalledWith(expect.any(Number));
  });
});
