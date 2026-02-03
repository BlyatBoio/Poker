// A simple Netlify Function
exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: `Hello World!` }),
  };
};