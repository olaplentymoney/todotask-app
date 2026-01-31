const handler = require('../app');
const mockResponse = () => {
  const res = {};
  res.writeHead = jest.fn();
  res.end = jest.fn();
  res.setHeader = jest.fn();
  return res;
};

describe('PUT /todo', () => {
  it('responds to update todo request', () => {
    const body = JSON.stringify({
      id: '123',
      title: 'Updated title',
      status: 'completed',
    });

    const req = {
      method: 'PUT',
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
