from http import HTTPStatus

import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.anyio


async def test_root_endpoint(async_client: AsyncClient) -> None:
    response = await async_client.get('/')

    assert response.status_code == HTTPStatus.OK
    assert response.json() == {'message': 'Findle API'}
