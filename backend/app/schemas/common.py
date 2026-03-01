from pydantic import BaseModel


class ErrorResponse(BaseModel):
    status: str = "error"
    code: str
    message: str
    retryable: bool = False


class ApiMeta(BaseModel):
    status: str = "ok"
