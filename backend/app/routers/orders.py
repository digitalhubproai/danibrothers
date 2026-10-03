import json
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..config import settings
from ..deps import get_db
from ..models import Order, OrderItem, Product, User
from ..schemas import OrderIn, OrderOut
from ..security import get_current_user

router = APIRouter(prefix="/api", tags=["orders"])


def first_image_of(product: Product) -> str | None:
    try:
        images = json.loads(product.images)
        if isinstance(images, list) and images and isinstance(images[0], str):
            return images[0]
    except (ValueError, TypeError):
        pass
    return None


def order_to_dict(order: Order) -> dict:
    items = [
        {
            "id": item.id,
            "productId": item.product_id,
            "name": item.name,
            "slug": item.slug,
            "image": item.image,
            "price": float(item.price),
            "qty": item.qty,
            "productSlug": None,
            "productStock": None,
        }
        for item in order.items
    ]
    user = None
    if order.user is not None:
        user = {"id": order.user.id, "name": order.user.name, "email": order.user.email}
    return {
        "id": order.id,
        "orderNumber": order.order_number,
        "userId": order.user_id,
        "customerName": order.customer_name,
        "phone": order.phone,
        "email": order.email,
        "address": order.address,
        "city": order.city,
        "notes": order.notes,
        "paymentMethod": order.payment_method,
        "subtotal": float(order.subtotal),
        "shipping": float(order.shipping),
        "total": float(order.total),
        "status": order.status,
        "createdAt": order.created_at.isoformat(),
        "updatedAt": order.updated_at.isoformat(),
        "items": items,
        "itemCount": sum(i.qty for i in order.items),
        "user": user,
    }


def new_order_number() -> str:
    stamp = datetime.now(timezone.utc).strftime("%y%m%d")
    return f"DB-{stamp}-{uuid.uuid4().hex[:6].upper()}"


@router.post("/orders", status_code=201)
def place_order(
    data: OrderIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> OrderOut:
    # Prices come from the database, never the client — a tampered cart cannot
    # buy a laptop for one rupee.
    ids = list(dict.fromkeys(e.productId for e in data.cart))
    products = {p.id: p for p in db.scalars(select(Product).where(Product.id.in_(ids))).all()}

    missing = [pid for pid in ids if pid not in products]
    if missing:
        raise HTTPException(
            status_code=400,
            detail={"message": "Some items in your cart are no longer available."},
        )

    order = Order(
        order_number=new_order_number(),
        user_id=user.id,
        customer_name=data.customerName.strip(),
        phone=data.phone.strip(),
        email=data.email,
        address=data.address.strip(),
        city=data.city.strip(),
        notes=data.notes,
        payment_method=data.paymentMethod,
        status="PENDING",
        shipping=350,
    )

    subtotal = 0
    for entry in data.cart:
        product = products[entry.productId]
        if product.stock < entry.qty:
            raise HTTPException(
                status_code=409,
                detail={
                    "message": f"Only {product.stock} left of {product.name}.",
                    "fieldErrors": {"cart": f"Only {product.stock} left of {product.name}."},
                },
            )
        price = float(product.price)
        order.items.append(
            OrderItem(
                product_id=product.id,
                name=product.name,
                slug=product.slug,
                image=first_image_of(product),
                price=product.price,
                qty=entry.qty,
            )
        )
        product.stock -= entry.qty
        subtotal += price * entry.qty

    order.subtotal = subtotal
    order.total = subtotal + float(order.shipping)
    db.add(order)
    db.commit()
    db.refresh(order, ["items", "user"])
    return OrderOut.model_validate(order_to_dict(order))


@router.get("/orders/mine")
def my_orders(
    user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> dict:
    rows = db.scalars(
        select(Order).where(Order.user_id == user.id).order_by(Order.created_at.desc())
    ).all()
    return {"orders": [OrderOut.model_validate(order_to_dict(o)) for o in rows]}


@router.get("/orders/{order_id}")
def get_order(order_id: str, db: Session = Depends(get_db)) -> OrderOut:
    # Public by design: the frontend treats this link as the receipt and the id
    # is an unguessable UUID.
    try:
        oid = str(uuid.UUID(order_id))
    except ValueError:
        raise HTTPException(status_code=404, detail={"message": "Order not found."})
    order = db.get(Order, oid)
    if order is None:
        raise HTTPException(status_code=404, detail={"message": "Order not found."})
    _ = order.items, order.user
    return OrderOut.model_validate(order_to_dict(order))
