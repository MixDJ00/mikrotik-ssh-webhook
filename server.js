const express = require('express');
const bodyParser = require('body-parser');
const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

const app = express();
app.use(bodyParser.json());

app.post('/update-user', async (req, res) => {
  const { host, port, user, pass, oldUser, newUser, newPass } = req.body;

  if (!host || !port || !user || !pass || !oldUser || !newUser || !newPass) {
    return res.status(400).send({ success: false, error: "Thiếu thông tin đầu vào!" });
  }

  try {
    await ssh.connect({
      host: host,
      port: port,
      username: user,
      password: pass,
    });

    const command = `/ppp secret set [find name="${oldUser}"] name="${newUser}" password="${newPass}"`;
    const result = await ssh.execCommand(command);

    ssh.dispose(); // đóng kết nối sau khi dùng

    res.send({ success: true, output: result.stdout || result.stderr });
  } catch (error) {
    res.status(500).send({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Webhook Mikrotik SSH đang chạy tại cổng ${PORT}`);
});
