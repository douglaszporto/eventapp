package classes;

import play.*;
import models.*;
import java.util.*;
import com.google.gson.*;
import java.lang.reflect.*;

public class GroupSerializer implements JsonSerializer<GroupModel>{

	static GroupSerializer instance;

	public static GroupSerializer getInstance(){
		if(instance == null)
			instance = new GroupSerializer();

		return instance;
	}

	@Override
	public JsonElement serialize(final GroupModel group, final Type type,
			final JsonSerializationContext context){
		final JsonObject objGroup = new JsonObject();
		final JsonArray participants = new JsonArray();
		JsonObject participantData = new JsonObject();

		if(group.participants != null) {
			for(UserModel user : group.participants) {
				participantData = new JsonObject();
				participantData.addProperty("id", user.id);
				participantData.addProperty("email", user.email);
				participants.add(participantData);
			}
		}

		objGroup.addProperty("id", group.id);
		objGroup.addProperty("name", group.name);
		objGroup.add("participants", participants);

		return objGroup;
	}

}