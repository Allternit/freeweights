# OpenReasoning-Nemotron-1.5B Overview

## Usage (Transformers.js)

If you haven't already, you can install the [Transformers.js](https://huggingface.co/docs/transformers.js) JavaScript library from [NPM](https://www.npmjs.com/package/@huggingface/transformers) using:
```bash
npm i @huggingface/transformers
```

You can then generate text as follows:
```js
import { pipeline, TextStreamer } from "@huggingface/transformers";

// Create a text generation pipeline
const generator = await pipeline(
  "text-generation",
  "onnx-community/OpenReasoning-Nemotron-1.5B-ONNX",
  { dtype: "q4", device: "webgpu" },
);

// Define the list of messages
const prompt = "x^2 + 2x - 8 = 0";
const messages = [
  { role: "user", content: `Solve the following math problem. Make sure to put the answer (and only answer) inside \\boxed{}.\n\n${prompt}` },
];

// Generate a response
const output = await generator(messages, {
    max_new_tokens: 4096,
    streamer: new TextStreamer(generator.tokenizer, { skip_prompt: true, skip_special_tokens: true}),
});
console.log(output[0].generated_text.at(-1).content);
```

<details>

<summary>See example output</summary>

```
<think>
I have this equation: \( x^2 + 2x - 8 = 0 \). It's a quadratic equation, and I need to solve for x. The general form is \( ax^2 + bx + c = 0 \), so here a = 1, b = 2, c = -8.

I can use the quadratic formula: \( x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a} \).

Plugging in the values: b = 2, so -b = -2; c = -8, so -4ac = -4(1)(-8) = 32.

The discriminant D = b^2 - 4ac = (2)^2 - 4(1)(-8) = 4 + 32 = 36.

Since D is positive, there are two real solutions.

x = [-b ± sqrt(D)] / (2a) = [-2 ± sqrt(36)] / 2 = [-2 ± 6]/2.

Now, two cases:

First, with +: (-2 + 6)/2 = 4/2 = 2.

Second, with -: (-2 - 6)/2 = (-8)/2 = -4.

So, x = 2 or x = -4.

I could also factor this. Since it's (x^2 + 2x - 8) = 0.

I need two numbers that multiply to -8 and add to 2. 4 and -2: 4 * -2 = -8, 4 + (-2) = 2. Yes, so (x + 4)(x - 2) = 0? Let me check.

(x + 4)(x - 2) = x^2 - 2x + 4x - 8 = x^2 + 2x - 8. Yes, perfect.

So, (x + 4)(x - 2) = 0, so x = -4 or x = 2.

Same as before.

The problem says "solve the following math problem" and gives the equation, but it has an equal sign, so it's an equation to solve.

But in the text, it says "x^2 + 2x - 8 = 0", so it's clear.

Now, it says "make sure to put the answer (and only answer) inside \boxed{}."

So, I need to present the answer. Since there are two solutions, I should box both.

But typically, we might write x = 2 or x = -4.

Since it's an equation, the solution set is {-4, 2}.

But I think for the box, I should write the values.

Looking back at the problem, it says "x^2 + 2x - 8 = 0", and it's written with the equal sign, so it's an equation.

But in the instruction, it says "solve", so I need to find x.

Perhaps I should write the solutions.

Maybe they want the answer as a pair or something.

Another thought: sometimes in multiple choice, but here it's not multiple choice.

The problem is given as is, so I think I need to provide the solutions.

Perhaps I can write x = 2 or x = -4.

But for the box, I need to put only the answer.

Maybe list the values.

I recall that in some contexts, they might expect the answer in a specific format.

Since it's a quadratic, and I solved it, I think it's fine.

But let me see the equation again: "x^2 + 2x - 8 = 0"

And it has the equal sign, so it's clear.

Perhaps I should write the answer as x = -4 or x = 2.

But for the box, I need to put it neatly.

Since it's "only answer", perhaps I should write the values.

Another idea: sometimes they write the solution set.

But I think for this, it's straightforward.

I can write the answer as 2 and -4.

But let me confirm if I did it right.

x^2 + 2x - 8 = 0

At x=2: 4 + 4 - 8 = 0, yes.

x=-4: 16 - 8 - 8 = 16 - 16 = 0, yes.

So correct.

Now, for the box, I think I should write the solutions.

Perhaps they want the answer in a box, so I'll write x = -4 \text{ or } x = 2.

But the instruction says "only answer", so maybe just the values.

I think it's fine.

Since it's a math problem, and I need to box the final answer.

I recall that in some platforms, they might expect the answer as a set or something.

But I think for simplicity, I'll write the solutions.

Perhaps I can write "x = -4 or x = 2".

But let me see the format.

Another thought: the equation is written with the equal sign, so it's an equation, and I solved it.

But in the answer, I need to present x.

I think I'm overcomplicating.

I'll box the values.

So, the solutions are x = -4 and x = 2.

So, for the box, I'll put -4 and 2.

But to be clear, I can write "x = -4 \text{ or } x = 2".

But since it says "only answer", perhaps just the numbers.

I think it's acceptable.

I can write the solution set: \{-4, 2\}.

But that might be too formal.

In many contexts, they just list the values.

Since it's a quadratic, and I found the roots.

I think I'll go with x = -4 or x = 2.

But for the box, I need to put it inside.

Perhaps the problem expects me to write the answer as per the equation.

Another idea: maybe they want the answer in a specific order, like ascending order.

So, -4 and 2.

So, I'll write -4 and 2.

But to be precise, I'll include the variable.

I think for the box, I'll put the values.

Let me see similar problems.

I recall that in some cases, they write "x = \text{value}".

But here, since there are two, I need to specify.

Perhaps I can write "x = -4 \text{ or } x = 2".

But for the box, I'll put that.

The instruction says "put the answer (and only answer) inside \boxed{}", so I think I should put the solution.

Perhaps they expect the answer as a number, but there are two.

Unless I made a mistake.

The equation is x^2 + 2x - 8 = 0, which is correct.

Maybe it's part of a larger problem, but no, it's given as is.

Perhaps I need to solve for x, and the answer is the values.

I think I'm fine.

So, I'll box the solutions.

So, the answer is x = -4 or x = 2.

For the box, I'll write \boxed{-4} and \boxed{2}, but that might be for separate boxes, but it's one answer.

I think it's better to write it as a pair or something.

I can write "x = -4 \text{ and } x = 2" but "and" might imply both, but it's or.

In math, it's clear.

To avoid confusion, I'll write the solution set.

So, \boxed{\{-4, 2\}}.

That might be acceptable.

Since it's an equation, the solution is the set of x that satisfy it.

I think that's fine.

Some people write "x = -4 or x = 2".

But for the box, I'll put the set.

I recall that in some textbooks, they list the values.

I think I'll do \boxed{-4} and \boxed{2}, but that's two boxes, but the instruction says "inside \boxed{}", singular, so one box.

So, I need one box.

So, \boxed{\text{ } -4 \text{ and } 2 \text{ }} or something.

To be neat, I'll write \boxed{-4, 2}.

But it might not be clear.

I can write "x = -4 \text{ or } x = 2" inside the box.

But that might be messy.

Another idea: since it's a quadratic, and I solved it, I can just state the roots.

I think for this context, it's okay.

Perhaps the problem is to find x, and I have it.

I'll go with \boxed{-4} and \boxed{2}, but since it's one answer, I'll put both in one box.

So, \boxed{-4 \text{ and } 2}.

To make it look better, \boxed{2,\ -4}.

But I think it's fine.

I recall that in the quadratic formula, I got x = [-2 ± 6]/2, which is 4/2=2 and -8/2=-4, so the values are 2 and -4.

So, I'll box 2 and -4.

But to specify, I'll write the solutions.

I think I'm ready.

So, the answer is x = -4 or x = 2.

For the box, I'll put \boxed{-4} and \boxed{2}, but that's two boxes.

The instruction says "inside \boxed{}", so one box.

So, I'll write \boxed{\text{ } -4 \text{ and } 2 \text{ }}.

To save space, \boxed{-4, 2}.

I think that's acceptable.

Some platforms use that.

So, I'll do that.

But let me confirm the equation once more.

x^2 + 2x - 8 = 0.

Multiply both sides by 4 to make it easier, but no need.

Or, complete the square.

x^2 + 2x = 8, then (x+1)^2 -1 =8, so (x+1)^2 =9, so x+1 = ±3, so x=2 or x=-4. Same thing.

So, no issue.

Therefore, the solutions are x = -4 and x = 2.

So, for the box, I'll put \boxed{-4} and \boxed{2}, but since it's one answer, I'll put both in one box.

Perhaps \boxed{2,\ -4}.

I think it's fine.

I'll write the answer as -4 and 2.

So, \boxed{-4 \text{ and } 2}

But to be precise, I'll use the set notation.

I think for this level, it's okay.

Another thought: the problem says "solve", and in some contexts, they might expect the answer as a number, but here there are two, so I need to include both.

Perhaps they want the product or sum, but no, it says solve the equation.

So, I think I'm good.

I'll go with \boxed{-4} and \boxed{2}, but since it's one box, I'll write \boxed{2,\ -4}.

Yes.

So, the final answer is 2 and -4.

To match the format, I'll put it as such.
</think>
The equation to solve is \(x^2 + 2x - 8 = 0\).

This is a quadratic equation in the form \(ax^2 + bx + c = 0\), where \(a = 1\), \(b = 2\), and \(c = -8\).

The solutions are found using the quadratic formula:
\[
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
\]

Substitute the values:
\[
x = \frac{-2 \pm \sqrt{2^2 - 4(1)(-8)}}{2(1)} = \frac{-2 \pm \sqrt{4 + 32}}{2} = \frac{-2 \pm \sqrt{36}}{2} = \frac{-2 \pm 6}{2}
\]

This gives two solutions:
- \(x = \frac{-2 + 6}{2} = \frac{4}{2} = 2\)
- \(x = \frac{-2 - 6}{2} = \frac{-8}{2} = -4\)

Thus, the solutions are \(x = -4\) and \(x = 2\).

The answer is presented as the values of \(x\) that satisfy the equation.

\boxed{-4,\ 2}

```

</details>

