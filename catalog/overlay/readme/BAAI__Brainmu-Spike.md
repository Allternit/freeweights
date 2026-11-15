<p align="center">
  <img src="src/assets/brainmu-spike-banner.png" alt="Brainμ-Spike" width="900">
</p>

# Brainμ-Spike：脉冲相机影像重建

北京大学余肇飞团队与北京智源人工智能研究院（BAAI）联合开展面向 Brainmu 模型微调的脉冲相机影像重建研究。

## 目录说明

```text
config.json         小网络结构、输入规格及推理参数
model.safetensors   小网络权重
README.md           项目说明
src/
├── code/           训练、条件图像导出与微调代码
├── scripts/        安装、推理和网页入口
├── ui/             网页界面与多 GPU 调度
├── vendor/Brainmu/  适配后的上游模型代码
├── configs/        配置示例
├── tests/          单元测试
├── assets/         标识图片
├── requirements.txt
├── LICENSE
└── NOTICE
```

根目录权重对应脉冲重建卷积模块。基础大模型和 LoRA 权重暂未发布；完整生成流程需要另行准备这两部分权重。代码来源与许可见 [LICENSE](src/LICENSE) 和 [NOTICE](src/NOTICE)。


## 环境安装

需要 Linux、NVIDIA GPU 和 uv。安装脚本使用 Python 3.12、PyTorch 2.11.0、torchvision 0.26.0、CUDA 13.0 对应的 PyTorch 构建，以及 FlashAttention 2.8.3.post1；请准备兼容的 NVIDIA 驱动及用于编译扩展的 CUDA 工具链。其余依赖见 `src/requirements.txt`。

在仓库根目录执行：

```bash
bash src/scripts/setup_uv.sh
```

脚本创建 `src/.venv` 并安装依赖，不覆盖已有环境。若已有兼容环境，可在评测时设置 `BRAINMU_ENV=/path/to/environment`；命令行评测启动脚本仍需要 uv。

## 小网络推理

在仓库根目录执行；本入口读取根目录的配置和 safetensors 权重，不加载大模型。只运行此入口可按 [轻量环境说明](src/USAGE.md) 安装 CPU 依赖。

```bash
python src/scripts/infer_frontend.py \
  --spike-dir /path/to/test/spike \
  --gt-dir /path/to/test/gt \
  --output-dir outputs/frontend_test \
  --device cpu
```

输入 DAT 为 41 × 250 × 400 的二值序列，little-bit 打包，共 512,500 字节；读取时沿高度翻转。GT 为同名 400 × 250 PNG。`--gt-dir` 可省略；提供 GT 时输出逐图 PSNR/SSIM 与平均指标。`--limit 3` 可用于小规模验证；GPU 环境可选择 `--device cuda:0`。

## 完整流程推理与评测

准备好基础模型、LoRA 和数据，并激活 `src/.venv` 后，从仓库根目录执行：

```bash
CUDA_VISIBLE_DEVICES=0 bash src/scripts/test.sh \
  --model-path /path/to/base_model \
  --adapter /path/to/adapter.safetensors \
  --frontend "$PWD/model.safetensors" \
  --spike-dir /path/to/test/spike \
  --gt-dir /path/to/test/gt \
  --output-dir "$PWD/outputs/test1000"
```

默认检查并评测 1,000 对数据，固定提示词为 `Restore the clean image.`。可通过 `--prompt` 自定义提示词。常用选项：

- `--check-only`：只检查文件与数据，不执行模型推理；仍需提供权重文件路径。
- `--expected-count N`：调整要求的数据数量。
- `--expected-count 0 --limit 3`：仅对排序后的前三张进行小规模试运行。

每次使用新的输出目录。输出包括：

| 文件或目录 | 内容 |
| --- | --- |
| `condition/` | 卷积模块生成的条件图像 |
| `prediction/` | 重建 RGB 图像 |
| `metrics.csv` | 逐样本指标 |
| `metrics.json` | 已完成数量、平均指标和运行状态 |
| `dataset_manifest.json` | 输入文件清单及内容哈希 |
| `run_config.json` | 推理设置与运行环境信息 |

评测将预测图像转换为灰度、归一化到 `[0,1]`，逐图计算 PSNR 后取平均；SSIM 使用 11 × 11 高斯窗口、σ=1.5，不裁剪边界。GT 会按预测尺寸调整。只有 `status=complete` 且完成数量等于请求数量才表示评测结束。请使用独立测试数据；程序不会自动检测训练与测试集重叠。

## 网页演示

```bash
source src/.venv/bin/activate
bash src/scripts/start_ui.sh
```

打开 `http://127.0.0.1:8997`，依次指定权重路径、加载模型、加载测试数据并开始评测。界面支持 1/2/4/8 卡，默认 8 卡；请在加载前按可用 GPU 数量选择。网页入口预期 1,000 对 DAT/GT，其他数量请使用命令行入口。

远程部署时，在本地建立两个端口转发：

```bash
ssh -N -L 8997:127.0.0.1:8997 -L 8998:127.0.0.1:8998 USER@HOST
```

界面没有用户认证，请通过 SSH 转发访问，不要直接暴露到公网。在启动终端按 `Ctrl+C` 停止服务。


