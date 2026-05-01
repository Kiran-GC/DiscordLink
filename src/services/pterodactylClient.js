const axios = require("axios");

class PteroClient {
  constructor() {
    this.client = axios.create({
      baseURL: "https://panel.pebblehost.com/api/client",
      headers: {
        Authorization: `Bearer ${process.env.PTERO_API_KEY}`,
        "Content-Type": "application/json",
        Accept: "Application/vnd.pterodactyl.v1+json"
      }
    });
  }

  async getState(serverId) {
    const res = await this.client.get(`/servers/${serverId}/resources`);

    // 🔍 DEBUG (remove later)
    console.log("Ptero Response:", JSON.stringify(res.data, null, 2));

    return res.data?.attributes?.state;
  }

  async power(serverId, signal) {
    return this.client.post(`/servers/${serverId}/power`, { signal });
  }
}

module.exports = new PteroClient();