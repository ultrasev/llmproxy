#!/usr/bin/env python3
from fastapi import FastAPI
import importlib.util
import os
from pathlib import Path
from starlette.middleware.cors import CORSMiddleware


def load_routes(app, routes_dir: Path, parent=""):
    """
    Recursively load and register FastAPI routers from Python files in the specified directory.
    """
    for path in routes_dir.iterdir():
        if path.is_dir():
            new_prefix = os.path.join(
                parent, path.name) if parent else path.name
            load_routes(app, path, parent=new_prefix)
        elif path.is_file() and path.suffix == ".py":
            module_name = os.path.join(
                parent, path.stem) if parent else path.stem
            spec = importlib.util.spec_from_file_location(module_name, path)
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
            if hasattr(module, "router"):
                prefix = getattr(module, "prefix",  module_name)
                prefix = f'/{prefix}'.replace("//", "/")
                print(f"Registering {prefix}", parent, module_name, sep=": ")
                app.include_router(module.router, prefix=prefix)


def create_app():
    app = FastAPI()
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["*"],
    )
    routes_dir = Path("api")
    load_routes(app, routes_dir)
    print(app.routes)
    return app


app = create_app()
