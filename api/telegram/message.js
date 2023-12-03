const allowCors = (fn) => async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }
  return await fn(req, res);
};

const handler = (request, response) => {
  try {
    console.log("received call from telegram sender");
    console.log(request.headers);
    console.log(request.body);
    response.status(200).json({ status: "ok" });
  } catch (e) {
    console.error(e);
    return response.status(500).json({ error: e });
  }
};

module.exports = allowCors(handler);
