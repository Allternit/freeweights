<center>
<div style="text-align: center;">
  <img 
    src="https://cdn-uploads.huggingface.co/production/uploads/61b8e2ba285851687028d395/2b08LKpev0DNEk6DlnWkY.png" 
    alt="Liquid AI"
    style="width: 100%; max-width: 100%; height: auto; display: inline-block; margin-bottom: 0.5em; margin-top: 0.5em;"
  />
</div>
<div style="display: flex; justify-content: center; gap: 0.5em;">
<a href="https://playground.liquid.ai/"><strong>Try LFM</strong></a> • <a href="https://docs.liquid.ai/lfm/getting-started/welcome"><strong>Docs</strong></a> • <a href="https://leap.liquid.ai/"><strong>LEAP</strong></a> • <a href="https://discord.com/invite/liquid-ai"><strong>Discord</strong></a>
</div>
</center>

<br>

（[_英語の後に日本語が続く_](#lfm2-350m-enjp-mt-日本語)）

# LFM2-350M-ENJP-MT

Based on the [LFM2-350M](https://huggingface.co/LiquidAI/LFM2-350M) model, this checkpoint has been fine-tuned for near real-time **bi-directional Japanese/English translation** of short-to-medium inputs.

![image/png](https://cdn-uploads.huggingface.co/production/uploads/65d6b6c1a07ad79084a0d214/hhras0rRcBPnQWmHmU7dC.png)

LFM2-350M-ENJP-MT delivers translation quality that is on par with models more than 10 times its size.

## 📊 Translation Quality

Below are sample translations produced by the model. These examples are meant to give you a feel for its strengths and typical style in both directions (English ➡️ Japanese and Japanese ➡️ English).

They include a mix of everyday text, technical descriptions, business communication, and news reporting, so you can gauge performance across different domains.

### EN ➡️ JP

These examples demonstrate the model's strength in product descriptions, technical passages, and formal explanations when translating into Japanese.

<table>
  <colgroup>
    <col style="width: 50%">
    <col style="width: 50%">
  </colgroup>
  <thead>
    <tr>
      <th>Source Text (EN)</th>
      <th>LFM2-350M-ENJP-MT (JP)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Fully Tested and Works Properly. 6 Months Warranty included! <p> Item pictured is the actual item for sale. <p> See above for full description, condition, and comments.</td>
      <td>「完全試験済みで正しく動作しています。保証期間は6ヶ月付属！」。<br> 写真に写っている商品が販売されている実物です。<br> 詳しく、状態、コメントは上記参照してください。</td>
    </tr>
    <tr>
      <td>Emphasis on human-AI collaboration. Instead of focusing solely on making fully autonomous AI systems, we are excited to build multimodal systems that work with people collaboratively.</td>
      <td>人とAIのコラボレーションに重点を置く。完全自律型AIシステムの構築にのみ焦点を当てるのではなく、人と協調して働くマルチモーダルシステムを構築できることに興奮しています。</td>
    </tr>
    <tr>
      <td>If your equipment fails due to normal use, please contact our customer service department so that we can assist you, We will repair or replace your equipment at our discretion. In some situations, we may choose to refund the full purchase price of an item.</td>
      <td>ご使用中の機器が通常使用により故障した場合は、お手伝いできるよう弊社カスタマーサービス部門にご連絡ください。 弊社の判断で機器の修理または交換を行います。状況によっては、製品の購入価格全額を返金する場合があります。</td>
    </tr>
    <tr>
      <td>2k USD to start for basic, 200 dollars for additional version.<br> - 50% of full amount of deposit,<br> - 3 proposals - end of month(3 drafts), will choose 1 and make final changes based on it<br> - Present another final version in a week</td>
      <td>基本版から始めるのに2,000ドル、追加バージョンでは200ドルの手数料が必要です。<br> - 保証金全額の50%が支払われる、<br> - 3つの案 - 月末（ドラフト3回分）、その案に基づいて1つを選んで最終的な変更を行う<br> - さらに1週間後に別の最終版を提出すること</td>
    </tr>
    <tr>
      <td>Lifestyle risk factors with strong evidence include lack of exercise, cigarette smoking, alcohol, and obesity. The risk of colon cancer can be reduced by maintaining a normal body weight through a combination of sufficient exercise and eating a healthy diet.</td>
      <td>強力な証拠がある生活習慣のリスク要因としては、運動不足、喫煙、飲酒、肥満などが挙げられ、十分な運動と健康的な食生活の組み合わせによる正常な体重維持を通じて、大腸がんの発症リスクを減らすことができる。</td>
    </tr>
  </tbody>
</table>

### JP ➡️ EN

These examples demonstrate the model’s ability to preserve nuance in news reporting, colloquial phrasing, and business contexts when translating into English.

<table>
  <colgroup>
    <col style="width: 50%">
    <col style="width: 50%">
  </colgroup>
  <thead>
    <tr>
      <th>Source Text (JP)</th>
      <th>LFM2-350M-ENJP-MT (EN)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>モデルからの回答は英語でもOKなのですよね。</td>
      <td>The answers from the models are okay in English, right?</td>
    </tr>
    <tr>
      <td>手間のかかるメルマガ作成作業、もっとラクに、もっと速くできたら——。<br>そう考えたことはありませんか？</td>
      <td>Have you ever wondered if you could create a cumbersome email newsletter more easily and quickly?</td>
    </tr>
    <tr>
      <td>X JAPANのYOSHIKIが、アニメ『ダンダダン』でグループの代表曲をオマージュした劇中歌が使用されたことを指摘して始まった議論。<p>8月22日には『ダンダダン』サイドが公式Xで騒動を謝罪、YOSHIKIも『ダンダダン』サイドと和解を報告したが、これに物言いをつけたのが、弁護士の紀藤正樹氏だった。</td>
      <td>The discussion began with the point that Yoshiki of X JAPAN mentioned that a song in the anime <em>Dandadan</em> paying homage to the group's signature tune was used as an insert song.<p> On August 22nd, the <em>Dandadan</em> side apologized on their official X page for the controversy, and Yoshiki also reported a reconciliation with the <em>Dandadan</em> side, but lawyer Masaki Kitō objected.</td>
    </tr>
    <tr>
      <td>（ブルームバーグ）： ＳＯＭＰＯホールディングスは27日夜、米国などを中心に展開する損害保険会社のアスペン・インシュアランス・ホールディングスを買収すると発表した。買収総額は約5200億円となる。<p>ニューヨーク証券取引所に上場しているアスペンの株式を１株当たり37.5ドル（約5600円）で全株を取得する。26日の終値を16％上回る水準。2026年上期中に買収手続きを完了する予定。<br> 買収資金は手元資金を充てる。<p>ＳＯＭＰＯにとっては17年に米損保エンデュランス・スペシャルティ・ホールディングスを約6400億円で買収して以来の大型案件となる。<br>人口減少で国内市場の縮小が見込まれる中、買収によって海外保険ビジネスの規模や収益を拡大し、再保険取引による安定的な収益の寄与も見込む。</td>
      <td>(Bloomberg): SOMPO Holdings announced on the evening of the 27th that it will acquire Aspen Insurance Holdings, a non-life insurance company operating primarily in the United States and elsewhere, for approximately ¥520 billion.<p> The acquisition will involve the purchase of all shares of Aspen’s shares listed on the New York Stock Exchange for $37.5 per share (approximately ¥5,600). This surpasses the closing price of the day by 16% and is scheduled to be completed within the first half of 2026. Funds for the acquisition will be provided from the company’s own capital.<p> For SOMPO, this is the largest acquisition since its 2017 acquisition of Endurance Specialty Holdings for approximately ¥640 billion. The acquisition is expected to expand the scale and revenue of its overseas insurance business amidst anticipated shrinking domestic markets due to population decline, and is also expected to contribute to stable revenue through reinsurance transactions.</td>
    </tr>
    <tr>
      <td>28歳にしてつかんだイングランドサッカー界でのチャンスを生かせるか。<br>チャンピオンシップ（英２部）の古豪ブラックバーンに電撃移籍した森下龍矢は意気込んでいる。<p>　サガン鳥栖と名古屋グランパスでプレーし、2024年から海を渡ってレギア・ワルシャワで奮闘してきた森下は先日、大橋祐紀のチームメイトとなることが決まった。<p>　日本ではSBが主戦場だった森下だが、昨季はポーランドで攻撃的なポジションにコンバートされ、ウィングやトップ下に前線と様々な役割をこなした。<br>すると、公式戦で14得点、14アシストとブレイク。<br>この飛躍に注目したブラックバーンに引き抜かれている。</td>
      <td>Can he capitalize on his chance in English football, which he seized at the age of 28?<br>Ryuya Morishita, having made a shocking move to Blackburn Rovers, a long-established club in the Championship (British second tier), is eager to make an impression.<p>Having played for Sagan Tosu and Nagoya Grampus, and having been striving with Legia Warsaw since 2024, Morishita recently announced he would become teammates with Yuki Ohashi.<p>For Morishita, his primary playing field in Japan was as a full-back, but he was converted to an attacking position in Poland last season, playing in various roles including wing-back and attacking midfielder.<br>He then broke through, scoring 14 goals and providing 14 assists in official matches.<br>The Blackburn club has been scouting for this promising player.</td>
    </tr>
  </tbody>
</table>

> [!NOTE]
> 📝 While LFM2-350M-ENJP-MT delivers strong out-of-the-box general-purpose English ↔️ Japanese translation, our primary
> goal is to provide a versatile, community-empowering base model—a foundation designed to make it easy to build
> best-in-class, task-specific translation systems.
>
> Like any base model, there are open areas for growth—in particular with extreme context lengths and specialized or
> context-sensitive translations, such as:
> - Technical & professional language (medical, legal, engineering)
> - Novel proper nouns (new products, brands, cultural references)
> - Industry-, domain-, or company-specific nuance (e-commerce, finance, internal corporate terminology)
>
> These are precisely the kinds of challenges that fine-tuning—by both Liquid AI and our developer community—can
> address. We see this model not just as an endpoint, but as a catalyst for a rich ecosystem of fine-tuned translation
> models tailored to real-world needs.

## 📄 Model details

**Generation parameters**: We recommend the following sampling parameters:
```
temperature: 0.5
top_p: 1.0
min_p: 0.1
repetition_penalty: 1.05
```

**System prompts**: LFM2-ENJP-MT **requires** one of the two following system prompts:
* "Translate to Japanese." for English to Japanese translation.
* "Translate to English." for Japanese to English translation.

> [!WARNING]
> ⚠️ The model cannot work as intended without one of these two system prompts.

**Chat Template**

The chat template can be applied using the dedicated [`.apply_chat_template()`](https://huggingface.co/docs/transformers/en/chat_templating#applychattemplate) function from Hugging Face transformers.
However, you must supply the system prompt that specifies the translation directionality.

E.g.
```python
chat = [
  {"role": "system", "content": "Translate to Japanese."},
  {"role": "user", "content": "What is C. elegans?"}
]

tokenizer.apply_chat_template(chat, tokenize=False)
```

With the model response:
```
<|startoftext|><|im_start|>system
Translate to Japanese.<|im_end|>
<|im_start|>user
What is C. elegans?<|im_end|>
<|im_start|>assistant
C. elegansとは何ですか？<|im_end|>
```

> [!WARNING]
> ⚠️ The model is intended for single turn conversations.

## 🏃 How to run LFM2

- Huggingface: [LFM2-350M](https://huggingface.co/LiquidAI/LFM2-350M)
- llama.cpp: [LFM2-350M-ENJP-MT-GGUF](https://huggingface.co/LiquidAI/LFM2-350M-ENJP-MT-GGUF)
- LEAP: [LEAP model library](https://leap.liquid.ai/models?model=lfm2-350m-enjp-mt)

You can use the following Colab notebooks for easy inference and fine-tuning:

| Notebook | Description | Link |
|-------|------|------|
| Inference | Run the model with Hugging Face's transformers library. | <a href="https://colab.research.google.com/drive/14IKuWvj2pyzn6QJQxRLpDTnE2IAjx0MD?usp=sharing"><img src="https://cdn-uploads.huggingface.co/production/uploads/61b8e2ba285851687028d395/vlOyMEjwHa_b_LXysEu2E.png" width="110" alt="Colab link"></a> |
| SFT (TRL) | Supervised Fine-Tuning (SFT) notebook with a LoRA adapter using TRL. | <a href="https://colab.research.google.com/drive/1j5Hk_SyBb2soUsuhU0eIEA9GwLNRnElF?usp=sharing"><img src="https://cdn-uploads.huggingface.co/production/uploads/61b8e2ba285851687028d395/vlOyMEjwHa_b_LXysEu2E.png" width="110" alt="Colab link"></a> |
| DPO (TRL) | Preference alignment with Direct Preference Optimization (DPO) using TRL. | <a href="https://colab.research.google.com/drive/1MQdsPxFHeZweGsNx4RH7Ia8lG8PiGE1t?usp=sharing"><img src="https://cdn-uploads.huggingface.co/production/uploads/61b8e2ba285851687028d395/vlOyMEjwHa_b_LXysEu2E.png" width="110" alt="Colab link"></a> |
| SFT (Axolotl) | Supervised Fine-Tuning (SFT) notebook with a LoRA adapter using Axolotl. | <a href="https://colab.research.google.com/drive/155lr5-uYsOJmZfO6_QZPjbs8hA_v8S7t?usp=sharing"><img src="https://cdn-uploads.huggingface.co/production/uploads/61b8e2ba285851687028d395/vlOyMEjwHa_b_LXysEu2E.png" width="110" alt="Colab link"></a> |
| SFT (Unsloth) | Supervised Fine-Tuning (SFT) notebook with a LoRA adapter using Unsloth. | <a href="https://colab.research.google.com/drive/1HROdGaPFt1tATniBcos11-doVaH7kOI3?usp=sharing"><img src="https://cdn-uploads.huggingface.co/production/uploads/61b8e2ba285851687028d395/vlOyMEjwHa_b_LXysEu2E.png" width="110" alt="Colab link"></a> |

## 📬 Contact

- Got questions or want to connect? [Join our Discord community](https://discord.com/invite/liquid-ai)
- If you are interested in custom solutions with edge deployment, please contact [our sales team](https://www.liquid.ai/contact).

## Citation

```
@article{liquidai2025lfm2,
 title={LFM2 Technical Report},
 author={Liquid AI},
 journal={arXiv preprint arXiv:2511.23404},
 year={2025}
}
```

# LFM2-350M-ENJP-MT (日本語)

[LFM2-350M](https://huggingface.co/LiquidAI/LFM2-350M)モデルをベースに、本チェックポイントは短文から中程度の入力に対する **日本語/英語の双方向リアルタイム翻訳** 用にファインチューニングされています。

![image/png](https://cdn-uploads.huggingface.co/production/uploads/65d6b6c1a07ad79084a0d214/hhras0rRcBPnQWmHmU7dC.png)

LFM2-350M-ENJP-MTは、サイズが10倍以上大きいモデルに匹敵する翻訳品質を実現します。

## 📊 翻訳品質

以下は本モデルが生成した翻訳例です。英語➡️日本語、日本語➡️英語の両方向における強みと典型的なスタイルを示しています。

日常文、技術的記述、ビジネス文書、報道などを含んでおり、さまざまな領域での性能を確認できます。

### 英語 ➡️ 日本語

これらの例は、日本語翻訳において、製品説明、技術文、形式的な解説での強みを示しています。

<table>
  <colgroup>
    <col style="width: 50%">
    <col style="width: 50%">
  </colgroup>
  <thead>
    <tr>
      <th>原文（英語）</th>
      <th>LFM2-350M-ENJP-MT（日本語）</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Fully Tested and Works Properly. 6 Months Warranty included! <p> Item pictured is the actual item for sale. <p> See above for full description, condition, and comments.</td>
      <td>「完全試験済みで正しく動作しています。保証期間は6ヶ月付属！」。<br> 写真に写っている商品が販売されている実物です。<br> 詳しく、状態、コメントは上記参照してください。</td>
    </tr>
    <tr>
      <td>Emphasis on human-AI collaboration. Instead of focusing solely on making fully autonomous AI systems, we are excited to build multimodal systems that work with people collaboratively.</td>
      <td>人とAIのコラボレーションに重点を置く。完全自律型AIシステムの構築にのみ焦点を当てるのではなく、人と協調して働くマルチモーダルシステムを構築できることに興奮しています。</td>
    </tr>
    <tr>
      <td>If your equipment fails due to normal use, please contact our customer service department so that we can assist you, We will repair or replace your equipment at our discretion. In some situations, we may choose to refund the full purchase price of an item.</td>
      <td>ご使用中の機器が通常使用により故障した場合は、お手伝いできるよう弊社カスタマーサービス部門にご連絡ください。 弊社の判断で機器の修理または交換を行います。状況によっては、製品の購入価格全額を返金する場合があります。</td>
    </tr>
    <tr>
      <td>2k USD to start for basic, 200 dollars for additional version.<br> - 50% of full amount of deposit,<br> - 3 proposals - end of month(3 drafts), will choose 1 and make final changes based on it<br> - Present another final version in a week</td>
      <td>基本版から始めるのに2,000ドル、追加バージョンでは200ドルの手数料が必要です。<br> - 保証金全額の50%が支払われる、<br> - 3つの案 - 月末（ドラフト3回分）、その案に基づいて1つを選んで最終的な変更を行う<br> - さらに1週間後に別の最終版を提出すること</td>
    </tr>
    <tr>
      <td>Lifestyle risk factors with strong evidence include lack of exercise, cigarette smoking, alcohol, and obesity. The risk of colon cancer can be reduced by maintaining a normal body weight through a combination of sufficient exercise and eating a healthy diet.</td>
      <td>強力な証拠がある生活習慣のリスク要因としては、運動不足、喫煙、飲酒、肥満などが挙げられ、十分な運動と健康的な食生活の組み合わせによる正常な体重維持を通じて、大腸がんの発症リスクを減らすことができる。</td>
    </tr>
  </tbody>
</table>

### 日本語 ➡️ 英語

これらの例は、ニュース記事のニュアンス、口語表現、ビジネス文脈を保ちながら英語に翻訳できるモデルの能力を示しています。

<table>
  <colgroup>
    <col style="width: 50%">
    <col style="width: 50%">
  </colgroup>
  <thead>
    <tr>
      <th>原文（日本語）</th>
      <th>LFM2-350M-ENJP-MT（英語）</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>モデルからの回答は英語でもOKなのですよね。</td>
      <td>The answers from the models are okay in English, right?</td>
    </tr>
    <tr>
      <td>手間のかかるメルマガ作成作業、もっとラクに、もっと速くできたら——。<br>そう考えたことはありませんか？</td>
      <td>Have you ever wondered if you could create a cumbersome email newsletter more easily and quickly?</td>
    </tr>
    <tr>
      <td>X JAPANのYOSHIKIが、アニメ『ダンダダン』でグループの代表曲をオマージュした劇中歌が使用されたことを指摘して始まった議論。<p>8月22日には『ダンダダン』サイドが公式Xで騒動を謝罪、YOSHIKIも『ダンダダン』サイドと和解を報告したが、これに物言いをつけたのが、弁護士の紀藤正樹氏だった。</td>
      <td>The discussion began with the point that Yoshiki of X JAPAN mentioned that a song in the anime <em>Dandadan</em> paying homage to the group's signature tune was used as an insert song.<p> On August 22nd, the <em>Dandadan</em> side apologized on their official X page for the controversy, and Yoshiki also reported a reconciliation with the <em>Dandadan</em> side, but lawyer Masaki Kitō objected.</td>
    </tr>
    <tr>
      <td>（ブルームバーグ）： ＳＯＭＰＯホールディングスは27日夜、米国などを中心に展開する損害保険会社のアスペン・インシュアランス・ホールディングスを買収すると発表した。買収総額は約5200億円となる。<p>ニューヨーク証券取引所に上場しているアスペンの株式を１株当たり37.5ドル（約5600円）で全株を取得する。26日の終値を16％上回る水準。2026年上期中に買収手続きを完了する予定。<br> 買収資金は手元資金を充てる。<p>ＳＯＭＰＯにとっては17年に米損保エンデュランス・スペシャルティ・ホールディングスを約6400億円で買収して以来の大型案件となる。<br>人口減少で国内市場の縮小が見込まれる中、買収によって海外保険ビジネスの規模や収益を拡大し、再保険取引による安定的な収益の寄与も見込む。</td>
      <td>(Bloomberg): SOMPO Holdings announced on the evening of the 27th that it will acquire Aspen Insurance Holdings, a non-life insurance company operating primarily in the United States and elsewhere, for approximately ¥520 billion.<p> The acquisition will involve the purchase of all shares of Aspen’s shares listed on the New York Stock Exchange for $37.5 per share (approximately ¥5,600). This surpasses the closing price of the day by 16% and is scheduled to be completed within the first half of 2026. Funds for the acquisition will be provided from the company’s own capital.<p> For SOMPO, this is the largest acquisition since its 2017 acquisition of Endurance Specialty Holdings for approximately ¥640 billion. The acquisition is expected to expand the scale and revenue of its overseas insurance business amidst anticipated shrinking domestic markets due to population decline, and is also expected to contribute to stable revenue through reinsurance transactions.</td>
    </tr>
    <tr>
      <td>28歳にしてつかんだイングランドサッカー界でのチャンスを生かせるか。<br>チャンピオンシップ（英２部）の古豪ブラックバーンに電撃移籍した森下龍矢は意気込んでいる。<p>　サガン鳥栖と名古屋グランパスでプレーし、2024年から海を渡ってレギア・ワルシャワで奮闘してきた森下は先日、大橋祐紀のチームメイトとなることが決まった。<p>　日本ではSBが主戦場だった森下だが、昨季はポーランドで攻撃的なポジションにコンバートされ、ウィングやトップ下に前線と様々な役割をこなした。<br>すると、公式戦で14得点、14アシストとブレイク。<br>この飛躍に注目したブラックバーンに引き抜かれている。</td>
      <td>Can he capitalize on his chance in English football, which he seized at the age of 28?<br>Ryuya Morishita, having made a shocking move to Blackburn Rovers, a long-established club in the Championship (British second tier), is eager to make an impression.<p>Having played for Sagan Tosu and Nagoya Grampus, and having been striving with Legia Warsaw since 2024, Morishita recently announced he would become teammates with Yuki Ohashi.<p>For Morishita, his primary playing field in Japan was as a full-back, but he was converted to an attacking position in Poland last season, playing in various roles including wing-back and attacking midfielder.<br>He then broke through, scoring 14 goals and providing 14 assists in official matches.<br>The Blackburn club has been scouting for this promising player.</td>
    </tr>
  </tbody>
</table>

> [!NOTE]
> 📝 LFM2-350M-ENJP-MTは汎用的な英日翻訳において高い性能を発揮しますが、我々の主な目標は、コミュニティに力を与える柔軟な基盤モデルを提供することです。  
> これは一流のタスク特化型翻訳システムを容易に構築できるよう設計された基盤です。
>
> すべての基盤モデルと同様に、成長の余地があります。特に以下のような場面です：
> - 極端に長い文脈や専門的/文脈依存の翻訳  
> - 専門分野の言語（医療、法律、工学）  
> - 新しい固有名詞（新製品、ブランド、文化的参照）  
> - 業界・分野・企業特有のニュアンス（EC、金融、社内用語）  
>
> これらはLiquid AIおよび開発者コミュニティによるファインチューニングで解決可能な課題です。  
> 本モデルを最終到達点ではなく、実世界に即した多様な翻訳モデル群を生み出す触媒として位置付けています。

## 📄 モデル詳細

**生成パラメータ**: 以下の生成パラメータを使用すること推奨します:

```
temperature: 0.5
top_p: 1.0
min_p: 0.1
repetition_penalty: 1.05
```

**システムプロンプト**: LFM2-ENJP-MTは以下のいずれかのシステムプロンプトを必須とします:
* 英語 → 日本語翻訳: `"Translate to Japanese."`
* 日本語 → 英語翻訳: `"Translate to English."`

> [!WARNING]
> ⚠️ これらのシステムプロンプトがなければモデルは意図通りに動作しません。

**チャットテンプレート**

チャットテンプレートは、Hugging Face Transformers の専用関数 [`.apply_chat_template()`](https://huggingface.co/docs/transformers/en/chat_templating#applychattemplate) を使用して適用できます。  
ただし、翻訳方向を指定するシステムプロンプトを与える必要があります。

例：
```python
chat = [
  {"role": "system", "content": "Translate to Japanese."},
  {"role": "user", "content": "What is C. elegans?"}
]

tokenizer.apply_chat_template(chat, tokenize=False)
```
モデルからの出力例：
```
<|startoftext|><|im_start|>system
Translate to Japanese.<|im_end|>
<|im_start|>user
What is C. elegans?<|im_end|>
<|im_start|>assistant
C. elegansとは何ですか？<|im_end|>
```

> [!WARNING]
> ⚠️ 本モデルはシングルターン会話用に設計されています。

## 🏃 LFM2の実行方法

- Hugging Face: [LFM2-350M](https://huggingface.co/LiquidAI/LFM2-350M)  
- llama.cpp: [LFM2-350M-ENJP-MT-GGUF](https://huggingface.co/LiquidAI/LFM2-350M-ENJP-MT-GGUF)  
- LEAP: [LEAP モデルライブラリ](https://leap.liquid.ai/models?model=lfm2-350m-enjp-mt)  

| ノートブック | 説明 | リンク |
|-------|------|------|
| 推論 | Hugging Faceのtransformersライブラリを使用してモデルを実行します。 | <a href="https://colab.research.google.com/drive/14IKuWvj2pyzn6QJQxRLpDTnE2IAjx0MD?usp=sharing"><img src="https://cdn-uploads.huggingface.co/production/uploads/61b8e2ba285851687028d395/vlOyMEjwHa_b_LXysEu2E.png" width="110" alt="Colab link"></a> |
| SFT (TRL) | TRLを使用したLoRAアダプターによる教師あり学習（SFT）を行います。 | <a href="https://colab.research.google.com/drive/1j5Hk_SyBb2soUsuhU0eIEA9GwLNRnElF?usp=sharing"><img src="https://cdn-uploads.huggingface.co/production/uploads/61b8e2ba285851687028d395/vlOyMEjwHa_b_LXysEu2E.png" width="110" alt="Colab link"></a> |
| DPO (TRL) | TRLを使用したDPOによる選好アライメントを行います。 | <a href="https://colab.research.google.com/drive/1MQdsPxFHeZweGsNx4RH7Ia8lG8PiGE1t?usp=sharing"><img src="https://cdn-uploads.huggingface.co/production/uploads/61b8e2ba285851687028d395/vlOyMEjwHa_b_LXysEu2E.png" width="110" alt="Colab link"></a> |
| SFT (Axolotl) | Axolotlを使用したLoRAアダプターによる教師あり学習（SFT）を行います。 | <a href="https://colab.research.google.com/drive/155lr5-uYsOJmZfO6_QZPjbs8hA_v8S7t?usp=sharing"><img src="https://cdn-uploads.huggingface.co/production/uploads/61b8e2ba285851687028d395/vlOyMEjwHa_b_LXysEu2E.png" width="110" alt="Colab link"></a> |
| SFT (Unsloth) | Unslothを使用したLoRAアダプターによる教師あり学習（SFT）を行います。 | <a href="https://colab.research.google.com/drive/1HROdGaPFt1tATniBcos11-doVaH7kOI3?usp=sharing"><img src="https://cdn-uploads.huggingface.co/production/uploads/61b8e2ba285851687028d395/vlOyMEjwHa_b_LXysEu2E.png" width="110" alt="Colab link"></a> |

## 📬 お問い合わせ

エッジ環境への導入を含むカスタムソリューションにご興味がある方は、[営業チーム](https://www.liquid.ai/ja/contact)までお問い合わせください。

## 引用

```
@article{liquidai2025lfm2,
 title={LFM2 Technical Report},
 author={Liquid AI},
 journal={arXiv preprint arXiv:2511.23404},
 year={2025}
}
```