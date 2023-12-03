const allowCors = (fn) => async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }
  return await fn(req, res);
};

const handler = (request, response) => {
  response.setHeader("Access-Control-Allow-Origin", "*");
  try {
    console.log("received call from telegram sender");
    console.log(request.headers);
    console.log(request.body);
  } catch (e) {
    console.error(e);
    return response.status(500).json({ error: e });
  }
};

module.exports = allowCors(handler);
