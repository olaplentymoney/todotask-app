const handler = require('../app');
const mockResponse = () => {
  const res = {};
  res.writeHead = jest.fn();
  res.end = jest.fn();
  res.setHeader = jest.fn();
  return res;
};

describe('POST /todo', () => {
  it('responds to create todo request', () => {
    const body = JSON.stringify({
      title: 'Test Task',
      description: 'Some description',
    });

    const req = {
      method: 'POST',
      url: '/todo',
      headers: {
        'content-type': 'application/json',
        authorization: 'Basic dGVzdDp0ZXN0', // base64 test:test
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
