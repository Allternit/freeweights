https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct with ONNX weights to be compatible with Transformers.js.

## Usage (Transformers.js)

If you haven't already, you can install the [Transformers.js](https://huggingface.co/docs/transformers.js) JavaScript library from [NPM](https://www.npmjs.com/package/@huggingface/transformers) using:
```bash
npm i @huggingface/transformers
```

**Example:** Text generation with `onnx-community/Qwen2.5-Coder-0.5B-Instruct`.

```js
import { pipeline } from "@huggingface/transformers";

// Create a text generation pipeline
const generator = await pipeline(
  "text-generation",
  "onnx-community/Qwen2.5-Coder-0.5B-Instruct",
  { dtype: "q4" },
);

// Define the list of messages
const messages = [
  { role: "system", content: "You are a helpful assistant." },
  { role: "user", content:  "Write a quick sort algorithm." },
];

// Generate a response
const output = await generator(messages, { max_new_tokens: 512, do_sample: false });
console.log(output[0].generated_text.at(-1).content);
```

<details>

<summary>Example output</summary>

````
Here's a simple implementation of the quick sort algorithm in Python:

```python
def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    
    return quick_sort(left) + middle + quick_sort(right)

# Example usage:
arr = [3, 6, 8, 10, 1, 2]
sorted_arr = quick_sort(arr)
print(sorted_arr)
```

### Explanation:

- **Base Case**: If the array has less than or equal to one element (i.e., `len(arr)` is less than or equal to `1`), it is already sorted and can be returned as is.

- **Pivot Selection**: The pivot is chosen as the middle element of the array.

- **Partitioning**: The array is partitioned into three parts: elements less than the pivot (`left`), elements equal to the pivot (`middle`), and elements greater than the pivot (`right`). These partitions are then recursively sorted.

- **Recursive Sorting**: The subarrays are sorted recursively using `quick_sort`.

This approach ensures that each recursive call reduces the problem size by half until it reaches a base case.
````
</details>


---

Note: Having a separate repo for ONNX weights is intended to be a temporary solution until WebML gains more traction. If you would like to make your models web-ready, we recommend converting to ONNX using [🤗 Optimum](https://huggingface.co/docs/optimum/index) and structuring your repo like this one (with ONNX weights located in a subfolder named `onnx`).