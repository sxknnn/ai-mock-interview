"""In-memory stand-in for the boto3 DynamoDB Table object.

Shared by the pytest suite and the local smoke-test script. Exercises
dynamo.py's real Query/UpdateExpression strings without needing a real
AWS/moto dependency.
"""


class _FakeBatchWriter:
    def __init__(self, table):
        self._table = table

    def __enter__(self):
        return self

    def __exit__(self, *exc_info):
        return False

    def put_item(self, Item):
        self._table._put(Item)


class FakeDynamoTable:
    def __init__(self):
        self.items: dict[tuple[str, str], dict] = {}

    def _put(self, item):
        self.items[(item["PK"], item["SK"])] = item

    def put_item(self, Item):
        self._put(Item)

    def batch_writer(self):
        return _FakeBatchWriter(self)

    def query(self, KeyConditionExpression, ExpressionAttributeValues):
        assert "begins_with(SK" in KeyConditionExpression
        pk = ExpressionAttributeValues[":pk"]
        prefix = ExpressionAttributeValues[":sk_prefix"]
        items = [
            v for (k_pk, k_sk), v in self.items.items()
            if k_pk == pk and k_sk.startswith(prefix)
        ]
        return {"Items": items}

    def update_item(self, Key, UpdateExpression, ExpressionAttributeValues, ExpressionAttributeNames=None):
        key = (Key["PK"], Key["SK"])
        item = self.items.setdefault(key, dict(Key))
        names = ExpressionAttributeNames or {}
        assert UpdateExpression.strip().startswith("SET ")
        for assignment in UpdateExpression.strip()[len("SET "):].split(","):
            field, _, value_ref = assignment.strip().partition(" = ")
            field = field.strip()
            field = names.get(field, field)
            item[field] = ExpressionAttributeValues[value_ref.strip()]
