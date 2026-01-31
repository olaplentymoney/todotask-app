function mockResponse() {
  const res = {};
  res.writeHead = jest.fn();
  res.end = jest.fn();
  res.setHeader = jest.fn();
  return res;
}

module.exports = mockResponse;
