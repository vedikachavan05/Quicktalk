from flask import Flask, request, render_template

app = Flask(__name__)

# Show the login form
@app.route("/")
def home():
    return render_template("login.html")

# Handle form submission
@app.route("/login", methods=["POST"])
def login():
    email = request.form["email"]
    password = request.form["password"]

    # Dummy check
    if email == "vedikac065@gmail.com" and password == "1234":
        return "✅ Login successful!"
    else:
        return "❌ Invalid credentials. Try again."

if __name__ == "__main__":
    app.run(debug=True)
