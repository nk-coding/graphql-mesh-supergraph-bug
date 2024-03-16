# GraphQL mesh supergraph bug

## Getting started

```
npm install
npm start
```

## Reproduce the bug
1. Open the browser and go to `http://localhost:4000/graphql`
2. Run the following query:
    ```graphql
    query {
        products(first: 1) {
            id
            name
            discounts {
                id
            }
            categories {
                id
                discounts {
                    id
                }
            }
        }
    }
    ```
3. You will receive the following error:
    ```json
    {
        "data": {
            "products": [
            null
            ]
        },
        "errors": [
            {
                "message": "Cannot return null for non-nullable field Category.discounts.",
                "path": [
                    "products",
                    0,
                    "categories",
                    0,
                    "discounts"
                ]
            }
        ]
    }
    ```
4. Interestingly, the following query works:
    ```graphql
        query {
            products(first: 1) {
                id
                name
                discounts {
                    id
                }
                categories {
                id
                    test: discounts {
                        id
                    }
                }
            }
        }
    ```