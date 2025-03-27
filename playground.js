const user = '123'
const password = '13'
const code = `def traffic_light(signal):
if signal == "green":
print("Cars go, pedestrians go!") #
Dangerous!
elif signal == "red":
print("Cars stop, pedestrians stop!") #
Confusing!
else:
print("Invalid signal.")
🚨
🚨
traffic_light("green")`
const jsondata = JSON.stringify(code)
console.log(jsondata)
