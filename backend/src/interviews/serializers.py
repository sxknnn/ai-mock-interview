from rest_framework import serializers


class StartSessionRequestSerializer(serializers.Serializer):
    roleId = serializers.CharField()


class AnswerItemSerializer(serializers.Serializer):
    questionIndex = serializers.IntegerField(min_value=1)
    text = serializers.CharField(allow_blank=True)


class SubmitAnswersRequestSerializer(serializers.Serializer):
    answers = AnswerItemSerializer(many=True)
