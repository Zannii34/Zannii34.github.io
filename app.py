@app.route("/chatbot", methods=["POST"])
def chatbot():
    message = request.json["message"].lower()

    conn = get_db()
    projects = conn.execute("SELECT title FROM projects").fetchall()
    conn.close()

    if "project" in message:
        titles = ", ".join([p["title"] for p in projects])
        return {"reply": f"I have built: {titles}"}

    elif "python" in message:
        return {"reply": "Yes, Wayne is experienced in Python, AI, and backend development."}

    elif "ai" in message:
        return {"reply": "Wayne has worked on AI systems including search algorithms and machine learning concepts."}

    else:
        return {"reply": "You can ask about projects, skills, AI, or contact information."}
