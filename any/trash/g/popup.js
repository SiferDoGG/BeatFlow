function send(type, extra = {}) {
    fetch("http://127.0.0.1:8000/" + type.toLowerCase(), {
        method: "POST"
    });
}