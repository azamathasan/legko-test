const http = require('http');

const hostname = '0.0.0.0';
const port = 3000;

async function getImage(url) {
  try {

    let elapsedMs = 0;
    let bytesCount = 0;

    for (let i = 0; i < 10; i++) {
      const startTime = performance.now();

      const response = await fetch(url);
      if (!response.ok) return `Ошибка сервера: ${response.status}`;

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.startsWith('image/')) {
        return `По ссылке не картинка, а ${contentType}`;
      }

      const imageBuffer = Buffer.from(await response.arrayBuffer());
      bytesCount = imageBuffer.length;

      elapsedMs += performance.now() - startTime;
    }
    

    const averageMs = Math.round(elapsedMs / 10);

    return `Успешно скачано байт: ${bytesCount}<br>Среднее время загрузки (мс): ${averageMs}`;

  } catch (error) {
    return `Не удалось получить картинку: ${error.message}`;
  }
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);

  if (parsedUrl.pathname === '/favicon.ico') {
    res.statusCode = 204;
    return res.end();
  }

  const imageUrl = parsedUrl.searchParams.get('url');
  let resultHtml = '';

  if (imageUrl) {
    const message = await getImage(imageUrl);
    console.log('message: ' + message);
    resultHtml = `<p>${message}</p>`;
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(`
    <p>Введите URL картинки</p>
    <form method="GET" action="/">
      <input type="text" name="url" value="${imageUrl ? imageUrl.replace(/"/g, '&quot;') : ''}" placeholder="Вставьте ссылку на картинку" size="50" required>
      <button type="submit">Скачать</button>
    </form>
    ${resultHtml}
  `);
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
