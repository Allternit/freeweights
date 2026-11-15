# Welcome to CLIP-as-service!
[GitHub: clip-as-service](https://github.com/jina-ai/clip-as-service)

[Docs: clip-as-service](https://clip-as-service.jina.ai/#)

CLIP-as-service is a low-latency high-scalability service for embedding images and text. It can be easily integrated as a microservice into neural search solutions.

⚡ Fast: Serve CLIP models with TensorRT, ONNX runtime and PyTorch w/o JIT with 800QPS[*]. Non-blocking duplex streaming on requests and responses, designed for large data and long-running tasks.

🫐 Elastic: Horizontally scale up and down multiple CLIP models on single GPU, with automatic load balancing.

🐥 Easy-to-use: No learning curve, minimalist design on client and server. Intuitive and consistent API for image and sentence embedding.

👒 Modern: Async client support. Easily switch between gRPC, HTTP, WebSocket protocols with TLS and compression.

🍱 Integration: Smooth integration with neural search ecosystem including Jina and DocArray. Build cross-modal and multi-modal solutions in no time.

[*] with default config (single replica, PyTorch no JIT) on GeForce RTX 3090.

## Try it!

## Install

[PyPI](https://img.shields.io/pypi/v/clip_client?color=%23ffffff&label=%20) is the latest version.

Make sure you are using Python 3.7+. You can install the client and server independently. It is **not required** to install both: e.g. you can install `clip_server` on a GPU machine and `clip_client` on a local laptop.

Client

```bash
pip install clip-client
```

Server (PyTorch)

```
pip install clip-server
```
Server (ONNX)

```
pip install "clip_server[onnx]"
```
Server (TensorRT)

```
pip install nvidia-pyindex 
pip install "clip_server[tensorrt]"
```
Server on [Google Colab](https://colab.research.google.com/github/jina-ai/clip-as-service/blob/main/docs/hosting/cas-on-colab.ipynb)



## Quick check

After installing, you can run the following commands for a quick connectivity check.

### Start the server

Start PyTorch Server 
```bash
python -m clip_server
```
Start ONNX Server 
```bash
python -m clip_server onnx-flow.yml
```
Start TensorRT Server 
```bash
python -m clip_server tensorrt-flow.yml
```

At the first time starting the server, it will download the default pretrained model, which may take a while depending on your network speed. Then you will get the address information similar to the following: 

```text
╭────────────── 🔗 Endpoint ───────────────╮
│  🔗     Protocol                   GRPC  │
│  🏠        Local          0.0.0.0:51000  │
│  🔒      Private    192.168.31.62:51000  │
|  🌍       Public   87.105.159.191:51000  |
╰──────────────────────────────────────────╯  
```

This means the server is ready to serve. Note down the three addresses shown above, you will need them later.

### Connect from client

```{tip}
Depending on the location of the client and server. You may use different IP addresses:
- Client and server are on the same machine: use local address, e.g. `0.0.0.0`
- Client and server are connected to the same router: use private network address, e.g. `192.168.3.62`
- Server is in public network: use public network address, e.g. `87.105.159.191`
```

Run the following Python script:

```python
from clip_client import Client

c = Client('grpc://0.0.0.0:51000')
c.profile()
```

will give you:

```text
 Roundtrip  16ms  100%
├──  Client-server network  8ms  49%
└──  Server  8ms  51%
    ├──  Gateway-CLIP network  2ms  25%
    └──  CLIP model  6ms  75%
{'Roundtrip': 15.684750003856607, 'Client-server network': 7.684750003856607, 'Server': 8, 'Gateway-CLIP network': 2, 'CLIP model': 6}
```

It means the client and the server are now connected. Well done!