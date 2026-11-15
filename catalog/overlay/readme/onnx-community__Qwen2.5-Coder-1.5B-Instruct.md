https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct with ONNX weights to be compatible with Transformers.js.

## Usage (Transformers.js)

If you haven't already, you can install the [Transformers.js](https://huggingface.co/docs/transformers.js) JavaScript library from [NPM](https://www.npmjs.com/package/@huggingface/transformers) using:
```bash
npm i @huggingface/transformers
```

**Example:** Text generation with `onnx-community/Qwen2.5-Coder-1.5B-Instruct`.

```js
import { pipeline } from "@huggingface/transformers";

// Create a text generation pipeline
const generator = await pipeline(
  "text-generation",
  "onnx-community/Qwen2.5-Coder-1.5B-Instruct",
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
Sure! Below is the implementation of the QuickSort algorithm in Python:

```python
def quicksort(arr):
    if len(arr) <= 1:
        return arr
    
    pivot = arr[len(arr) // 2]
    
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    
    return quicksort(left) + middle + quicksort(right)

# Example usage:
arr = [3, 6, 8, 10, 1, 2, 1] 
print("Original array:", arr)
sorted_arr = quicksort(arr)
print("Sorted array:", sorted_arr)
```

### Explanation:
- **Base Case**: If the length of the list `arr` is less than or equal to one (`len(arr) <= 1`), it means the list is already sorted and can be returned as it is.
- **Pivot Selection**: The chosen `pivot` element can be any element from the list (e.g., `len(arr)//2`). For simplicity here we choose this way.
- **Partitioning**:
   - Elements less than or equal to `pivot` are placed into a new list called `left`.
   - Elements equal to `pivot` are placed into another new list called `middle`.
   - Elements greater than or equal to `pivot` are placed into yet another new list called `right`.
- **Recursive Sorting**: The function recursively applies itself on these three lists (`left`, middle`, and right`) and concatenates them back together.

This implementation ensures that all elements less than or equal to any given element will appear before that element in their respective partitions.
````
</details>


---

Note: Having a separate repo for ONNX weights is intended to be a temporary solution until WebML gains more traction. If you would like to make your models web-ready, we recommend converting to ONNX using [🤗 Optimum](https://huggingface.co/docs/optimum/index) and structuring your repo like this one (with ONNX weights located in a subfolder named `onnx`).