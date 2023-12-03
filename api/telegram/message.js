module.exports = async (request, response) => {
  try {
    console.log("received call from telegram sender");
    console.log(request.headers);
    console.log(request.body);
  } catch (e) {
    console.error(e);
    return response.status(500).json({ error: e });
  }
};
