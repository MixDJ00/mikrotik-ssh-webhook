const express = require('express');
const bodyParser = require('body-parser');
const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

const app = express();
app.use(bodyParser.json());

app.post('/update-user', async (req, res) => {
  const { host, port, user, pass, oldUser, newUser, newPass } = req.body;

  if (!host || !port || !user || !pass || !newUser || !newPass) {
    return res.status(400).send({ success: false, error: "Thiếu thông tin đầu vào!" });
  }

  try {
    console.log(`🔐 Kết nối SSH tới ${host}:${port} với tài khoản ${user}`);
    await ssh.connect({
      host: host,
      port: 22, // luôn là SSH port
      username: user,
      password: pass,
    });

    const index = port - 10000; // giả định container là TSProxy_<index>

    const command = `
/container/envs/set [find name="TSPROXY_${index}_AUTH" key="PROXY_LOGIN"] value=${newUser}
/container/envs/set [find name="TSPROXY_${index}_AUTH" key="PROXY_PASSWORD"] value=${newPass}
/container stop [find interface="TSProxy_${index}"]
/container set [find interface="TSProxy_${index}"] envlist="TSPROXY_${index}_AUTH"
/delay 1
/container start [find interface="TSProxy_${index}"]
`;

    console.log('📤 Lệnh gửi tới Mikrotik:\n' + command);

    const result = await ssh.execCommand(command);
    ssh.dispose();

    console.log('📥 Phản hồi từ Mikrotik:\n' + result.stdout || result.stderr);

    res.send({ success: true, output: result.stdout || result.stderr });
  } catch (error) {
    console.error('❌ Lỗi khi kết nối hoặc thực thi SSH:', error.message);
    res.status(500).send({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Webhook Mikrotik SSH container đang chạy tại cổng ${PORT}`);
});
