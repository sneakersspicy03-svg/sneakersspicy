import json

products = []
for i in range(1, 1001):
    products.append({
        "id": f"test_{i}",
        "name": f"Sneaker de Prueba Elite #{i}",
        "brand": "Nike" if i % 2 == 0 else "Adidas",
        "price": 5000 + (i * 10),
        "image": "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&q=80&w=800",
        "images": {
            "front": "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&q=80&w=800",
            "back": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800",
            "left": "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&q=80&w=800",
            "right": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800",
            "top": "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&q=80&w=800",
            "bottom": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800"
        },
        "description": f"Este es el producto de prueba numero {i} para verificar la escalabilidad infinita de Sneakers Spicy.",
        "category": "Shoes",
        "availableSizes": [7, 8, 9, 10, 11, 12],
        "condition": "nuevo"
    })

with open('public/products_test.json', 'w') as f:
    json.dump(products, f, indent=2)

print("✅ Archivo 'public/products_test.json' con 1,000 productos generado con exito.")
